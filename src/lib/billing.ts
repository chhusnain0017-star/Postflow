export function addOneYear(start: Date | string) {
  const result = new Date(start);
  if (!Number.isFinite(result.getTime())) throw new Error("Activation date is invalid.");
  result.setUTCFullYear(result.getUTCFullYear() + 1);
  return result;
}