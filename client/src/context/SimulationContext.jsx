import { createContext, useContext, useEffect, useState } from 'react';
import { engine } from '../simulation/engine.js';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [state, setState] = useState(() => engine.getState());

  useEffect(() => {
    // Subscribe to engine state changes
    const unsub = engine.subscribe(setState);
    engine.start();

    return () => {
      unsub();
      engine.stop();
    };
  }, []);

  const controls = {
    bulbOn:   () => engine.cmd_BULB_ON(),
    bulbDim:  () => engine.cmd_BULB_DIM(),
    bulbOff:  () => engine.cmd_BULB_OFF(),
    tvOn:     () => engine.cmd_TV_ON(),
    tvOff:    () => engine.cmd_TV_OFF(),
    tvTimer:  () => engine.cmd_TV_TIMER(),
    setRuleEnabled:   (key, val) => engine.setRuleEnabled(key, val),
    setRuleThreshold: (key, val) => engine.setRuleThreshold(key, val),
    reset:    () => engine.reset(),
  };

  return (
    <SimulationContext.Provider value={{ state, controls }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used inside <SimulationProvider>');
  return ctx;
}
