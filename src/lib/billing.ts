export function addOneYear(start: Date | string) {
  const result = new Date(start);
  if (!Number.isFinite(result.getTime())) throw new Error("Activation date is invalid.");
  result.setUTCFullYear(result.getUTCFullYear() + 1);
  return result;
}

export function addTrialPeriod(start: Date | string) {
  const timestamp = new Date(start).getTime();
  if (!Number.isFinite(timestamp)) throw new Error("Trial start date is invalid.");
  return new Date(timestamp + 7 * 24 * 60 * 60 * 1000);
}