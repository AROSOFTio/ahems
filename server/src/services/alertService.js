// The current production scope no longer includes the notifications subsystem.
// Keep the simulation pipeline callable by exposing a no-op alert evaluator.
export async function evaluateRoomAlerts(_room, _appliances = []) {
  return [];
}
