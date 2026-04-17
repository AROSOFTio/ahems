/**
 * AHEMS Simulation Constants
 * Mirrors the exact hardware mapping from the Arduino embedded code:
 *   pin 10 = Bulb (60W), pin 6 = TV (120W), pin 13 = Fan (75W)
 *   A2 = Temperature sensor, A5/pin9 = LDR (light), occupancy = PIR
 */

// Appliance definitions  — matches Arduino pin assignments
export const APPLIANCES = {
  BULB: {
    key: 'BULB',
    label: 'Smart Bulb',
    pin: 10,
    watts: 60,
    states: ['ON', 'DIMMED', 'OFF'],
    defaultState: 'OFF',
  },
  TV: {
    key: 'TV',
    label: 'Television',
    pin: 6,
    watts: 120,
    states: ['ON', 'OFF'],
    defaultState: 'OFF',
  },
  FAN: {
    key: 'FAN',
    label: 'Cooling Fan',
    pin: 13,
    watts: 75,
    states: ['ON', 'OFF'],
    defaultState: 'OFF',
    autoOnly: true,        // fan is always auto-controlled in Arduino code
  },
};

// Sensor thresholds — exact values from Arduino code
export const THRESHOLDS = {
  TEMP_FAN_ON: 30,         // tempC > 30 → fan ON  (line: if(tempC>30))
  LIGHT_DARK: 40,          // light < 40% → "DARK" → bulb eligible
  OCCUPANCY_TV_TIMEOUT: 10, // seconds before TV auto-off when vacant (T-T timer)
  TV_TIMER_SECONDS: 30,    // T-T = TV on for 30s, then check occupancy
};

// Energy rate (UGX per kWh — typical Ugandan residential tariff)
export const TARIFF = {
  currency: 'UGX',
  ratePerKwh: 780,         // ~780 UGX/kWh (UMEME standard residential)
};

// Simulation tick interval in ms
export const TICK_MS = 2000;

// Sensor drift parameters — produces realistic oscillating values
export const SENSOR_PARAMS = {
  // Temperature oscillates between 22°C and 38°C
  tempBase: 28,
  tempAmplitude: 6,
  tempNoise: 0.4,
  tempPeriodSec: 120,      // full oscillation cycle in seconds

  // Light oscillates between 15% and 95% (simulates day/night)
  lightBase: 55,
  lightAmplitude: 40,
  lightNoise: 3,
  lightPeriodSec: 180,

  // Occupancy: probability of toggling state per tick
  occupancyToggleChance: 0.02,  // 2% per tick = occasional changes
};
