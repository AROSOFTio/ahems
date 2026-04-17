/**
 * AHEMS Simulation Engine
 *
 * This module faithfully replicates the Arduino loop() logic from the
 * embedded AHEMS system in JavaScript. It runs as a pure state-machine
 * that external React contexts subscribe to via callbacks.
 *
 * Arduino logic replicated:
 *   • temp > 30°C → Fan ON  (auto, always)
 *   • temp <= 30°C → Fan OFF
 *   • LDR dark + rule enabled → Bulb ON (full)
 *   • LDR dark + DIM command → Bulb DIMMED (50%)
 *   • No occupancy + rule enabled → TV OFF
 *   • TV timer (T-T) → TV ON 30s, then occupancy check 10s
 */

import {
  APPLIANCES,
  THRESHOLDS,
  TARIFF,
  TICK_MS,
  SENSOR_PARAMS,
} from './constants.js';

const MAX_LOG = 30;

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function sineWave(elapsedSec, periodSec, base, amplitude) {
  return base + amplitude * Math.sin((2 * Math.PI * elapsedSec) / periodSec);
}

function noise(amount) {
  return (Math.random() - 0.5) * 2 * amount;
}

function now() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

// ─── Initial State ───────────────────────────────────────────────────────────

function buildInitialState() {
  return {
    tick: 0,
    elapsedSec: 0,
    sensors: {
      temperature: SENSOR_PARAMS.tempBase,
      light: SENSOR_PARAMS.lightBase,
      occupancy: true,
    },
    appliances: {
      BULB: { state: 'OFF', watts: APPLIANCES.BULB.watts, brightness: 0 },
      TV:   { state: 'OFF', watts: APPLIANCES.TV.watts },
      FAN:  { state: 'OFF', watts: APPLIANCES.FAN.watts },
    },
    rules: {
      DARK_LIGHTS_ON:   { enabled: true,  threshold: THRESHOLDS.LIGHT_DARK, firing: false },
      HIGH_TEMP_FAN:    { enabled: true,  threshold: THRESHOLDS.TEMP_FAN_ON, firing: false },
      NO_OCCUPANCY_OFF: { enabled: false, firing: false },
    },
    tvTimer: {
      active: false,
      remainingSec: 0,
      phase: null,  // 'ON_PHASE' | 'OCCUPANCY_CHECK'
    },
    energy: {
      totalKwh: 0,
      costEstimate: 0,
      sessionStartTime: Date.now(),
      perAppliance: { BULB: 0, TV: 0, FAN: 0 },
    },
    log: [],
  };
}

// ─── Engine Class ─────────────────────────────────────────────────────────────

export class AhemsEngine {
  constructor() {
    this._state = buildInitialState();
    this._listeners = new Set();
    this._interval = null;
    this._manualCommands = [];
  }

  // ── Subscribe/Unsubscribe ──────────────────────────────────────────────────

  subscribe(fn) {
    this._listeners.add(fn);
    fn(this._state);  // emit current state immediately
    return () => this._listeners.delete(fn);
  }

  _emit() {
    const snapshot = JSON.parse(JSON.stringify(this._state));
    this._listeners.forEach(fn => fn(snapshot));
  }

  // ── Start / Stop ──────────────────────────────────────────────────────────

  start() {
    if (this._interval) return;
    this._interval = setInterval(() => this._tick(), TICK_MS);
  }

  stop() {
    clearInterval(this._interval);
    this._interval = null;
  }

  // ── Voice/Button Command API (mirrors Arduino switch(buf[1]) cases) ────────

  cmd_BULB_ON() {
    this._manualCommands.push({ type: 'BULB_ON' });
  }

  cmd_BULB_DIM() {
    this._manualCommands.push({ type: 'BULB_DIM' });
  }

  cmd_BULB_OFF() {
    this._manualCommands.push({ type: 'BULB_OFF' });
  }

  cmd_TV_ON() {
    this._manualCommands.push({ type: 'TV_ON' });
  }

  cmd_TV_OFF() {
    this._manualCommands.push({ type: 'TV_OFF' });
  }

  cmd_TV_TIMER() {
    // T-T command: TV on 30s, then occupancy check 10s
    this._manualCommands.push({ type: 'TV_TIMER' });
  }

  setRuleEnabled(ruleKey, enabled) {
    this._state.rules[ruleKey].enabled = enabled;
    this._addLog(`Rule "${ruleKey}" ${enabled ? 'enabled' : 'disabled'}`);
    this._emit();
  }

  setRuleThreshold(ruleKey, value) {
    if (this._state.rules[ruleKey]) {
      this._state.rules[ruleKey].threshold = value;
      this._emit();
    }
  }

  // ── Core Tick Loop ────────────────────────────────────────────────────────

  _tick() {
    const s = this._state;
    s.tick += 1;
    s.elapsedSec += TICK_MS / 1000;

    // 1. Update sensor readings (drifting sine + noise)
    this._updateSensors();

    // 2. Process any queued manual commands  
    this._processCommands();

    // 3. Run automation rules (Arduino loop() logic)
    this._runAutomationRules();

    // 4. Update TV timer if active
    this._updateTvTimer();

    // 5. Accumulate energy
    this._accumulateEnergy();

    this._emit();
  }

  // ── 1. Sensor Drift ───────────────────────────────────────────────────────

  _updateSensors() {
    const s = this._state;
    const p = SENSOR_PARAMS;

    const rawTemp = sineWave(s.elapsedSec, p.tempPeriodSec, p.tempBase, p.tempAmplitude)
      + noise(p.tempNoise);
    s.sensors.temperature = parseFloat(clamp(rawTemp, 18, 42).toFixed(1));

    const rawLight = sineWave(s.elapsedSec, p.lightPeriodSec, p.lightBase, p.lightAmplitude)
      + noise(p.lightNoise);
    s.sensors.light = parseFloat(clamp(rawLight, 5, 98).toFixed(1));

    // Occupancy: random toggle  with low probability
    if (Math.random() < p.occupancyToggleChance) {
      s.sensors.occupancy = !s.sensors.occupancy;
      this._addLog(
        s.sensors.occupancy
          ? 'Occupancy sensor: Room is now OCCUPIED'
          : 'Occupancy sensor: Room is now VACANT'
      );
    }
  }

  // ── 2. Process Manual Commands ────────────────────────────────────────────

  _processCommands() {
    const s = this._state;
    const isDark = s.sensors.light < (s.rules.DARK_LIGHTS_ON.threshold ?? THRESHOLDS.LIGHT_DARK);

    while (this._manualCommands.length > 0) {
      const cmd = this._manualCommands.shift();

      switch (cmd.type) {
        // case onRecord: "BULB" voice command
        case 'BULB_ON':
          if (isDark) {
            this._setBulbState('ON', 100);
            this._addLog('Manual: BULB ON command — bulb turned on (dark condition met)');
          } else {
            this._addLog('Manual: BULB ON ignored — room is not dark enough');
          }
          break;

        // case offRecord: "DIM" voice command
        case 'BULB_DIM':
          if (isDark) {
            this._setBulbState('DIMMED', 50);
            this._addLog('Manual: DIM command — bulb dimmed to 50%');
          } else {
            this._addLog('Manual: DIM ignored — room is not dark enough');
          }
          break;

        // case offRecord1: "B-OFF" voice command
        case 'BULB_OFF':
          this._setBulbState('OFF', 0);
          this._addLog('Manual: B-OFF command — bulb turned off');
          break;

        // case onRecord1: "TV" voice command
        case 'TV_ON':
          this._setTvState('ON');
          this._addLog('Manual: TV ON command executed');
          break;

        // case offRecord2: "T-OFF" voice command
        case 'TV_OFF':
          this._setTvState('OFF');
          this._addLog('Manual: T-OFF command — TV turned off');
          break;

        // case onRecord2: "T-T" timer voice command
        case 'TV_TIMER':
          s.tvTimer.active = true;
          s.tvTimer.remainingSec = THRESHOLDS.TV_TIMER_SECONDS;
          s.tvTimer.phase = 'ON_PHASE';
          this._setTvState('ON');
          this._addLog(`Manual: T-T TIMER started — TV on for ${THRESHOLDS.TV_TIMER_SECONDS}s`);
          break;
      }
    }
  }

  // ── 3. Arduino loop() Automation Rules ───────────────────────────────────

  _runAutomationRules() {
    const s = this._state;
    const { temperature, light, occupancy } = s.sensors;

    // Rule: HIGH_TEMP_FAN — mirrors: if(tempC>30) { digitalWrite(13,HIGH); }
    const tempThreshold = s.rules.HIGH_TEMP_FAN.threshold ?? THRESHOLDS.TEMP_FAN_ON;
    const fanShouldBeOn = s.rules.HIGH_TEMP_FAN.enabled && temperature > tempThreshold;
    const fanWasOn = s.appliances.FAN.state === 'ON';

    if (fanShouldBeOn !== fanWasOn) {
      s.appliances.FAN.state = fanShouldBeOn ? 'ON' : 'OFF';
      this._addLog(
        fanShouldBeOn
          ? `Auto: Fan ON — temperature ${temperature}°C exceeds ${tempThreshold}°C threshold`
          : `Auto: Fan OFF — temperature ${temperature}°C back below ${tempThreshold}°C`
      );
    }
    s.rules.HIGH_TEMP_FAN.firing = fanShouldBeOn;

    // Rule: DARK_LIGHTS_ON — mirrors: if(digitalRead(A5)==LOW) { ... }
    const lightThreshold = s.rules.DARK_LIGHTS_ON.threshold ?? THRESHOLDS.LIGHT_DARK;
    const isDark = light < lightThreshold;
    const lightRuleFiring = s.rules.DARK_LIGHTS_ON.enabled && isDark;
    const bulbIsOff = s.appliances.BULB.state === 'OFF';

    if (lightRuleFiring && bulbIsOff) {
      this._setBulbState('ON', 100);
      this._addLog(`Auto: Bulb ON — light level ${light}% is below ${lightThreshold}% (dark)`);
    } else if (!isDark && s.rules.DARK_LIGHTS_ON.enabled && s.appliances.BULB.state !== 'OFF') {
      this._setBulbState('OFF', 0);
      this._addLog(`Auto: Bulb OFF — light level ${light}% is now above ${lightThreshold}%`);
    }
    s.rules.DARK_LIGHTS_ON.firing = lightRuleFiring;

    // Rule: NO_OCCUPANCY_OFF — mirrors occupancy check in T-T timer section
    if (s.rules.NO_OCCUPANCY_OFF.enabled && !occupancy) {
      if (s.appliances.TV.state === 'ON') {
        this._setTvState('OFF');
        this._addLog('Auto: TV OFF — room is now vacant (No Occupancy rule)');
      }
      if (s.appliances.BULB.state !== 'OFF') {
        this._setBulbState('OFF', 0);
        this._addLog('Auto: Bulb OFF — room is now vacant (No Occupancy rule)');
      }
    }
    s.rules.NO_OCCUPANCY_OFF.firing = s.rules.NO_OCCUPANCY_OFF.enabled && !occupancy;
  }

  // ── 4. TV Timer (T-T command) ─────────────────────────────────────────────

  _updateTvTimer() {
    const s = this._state;
    if (!s.tvTimer.active) return;

    s.tvTimer.remainingSec -= TICK_MS / 1000;

    if (s.tvTimer.phase === 'ON_PHASE' && s.tvTimer.remainingSec <= 0) {
      // Switch to occupancy-check phase
      s.tvTimer.phase = 'OCCUPANCY_CHECK';
      s.tvTimer.remainingSec = THRESHOLDS.OCCUPANCY_TV_TIMEOUT;
      this._addLog('T-T timer: ON phase complete — checking occupancy…');
    } else if (s.tvTimer.phase === 'OCCUPANCY_CHECK' && s.tvTimer.remainingSec <= 0) {
      // End of timer — mirrors: if(digitalRead(9)==LOW) { TV ON } else { TV OFF }
      if (s.sensors.occupancy) {
        s.appliances.TV.state = 'ON';
        this._addLog('T-T timer: Occupancy detected — TV stays ON');
      } else {
        s.appliances.TV.state = 'OFF';
        this._addLog('T-T timer: No occupancy — TV turned OFF');
      }
      s.tvTimer.active = false;
      s.tvTimer.phase = null;
      s.tvTimer.remainingSec = 0;
    }
  }

  // ── 5. Energy accumulation ────────────────────────────────────────────────

  _accumulateEnergy() {
    const s = this._state;
    const tickHours = TICK_MS / 1000 / 3600;

    for (const key of ['BULB', 'TV', 'FAN']) {
      const app = s.appliances[key];
      const isActive = app.state === 'ON' || app.state === 'DIMMED';
      const effectiveWatts = app.state === 'DIMMED'
        ? APPLIANCES[key].watts * 0.5
        : APPLIANCES[key].watts;

      if (isActive) {
        const kwh = (effectiveWatts / 1000) * tickHours;
        s.energy.perAppliance[key] += kwh;
        s.energy.totalKwh += kwh;
      }
    }
    s.energy.costEstimate = s.energy.totalKwh * TARIFF.ratePerKwh;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _setBulbState(state, brightness) {
    this._state.appliances.BULB.state = state;
    this._state.appliances.BULB.brightness = brightness;
  }

  _setTvState(state) {
    this._state.appliances.TV.state = state;
  }

  _addLog(message) {
    const s = this._state;
    s.log.unshift({ time: now(), message });
    if (s.log.length > MAX_LOG) s.log.length = MAX_LOG;
  }

  // ── Public state accessor ─────────────────────────────────────────────────
  getState() {
    return this._state;
  }

  reset() {
    this.stop();
    this._state = buildInitialState();
    this._manualCommands = [];
    this.start();
    this._emit();
  }
}

// Singleton instance
export const engine = new AhemsEngine();
