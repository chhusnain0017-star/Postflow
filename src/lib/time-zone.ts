const localDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function localDateTimeToUtc(value: string, timeZone: string) {
  const match = localDateTimePattern.exec(value);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match.map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  if (!Number.isFinite(target)) return null;

  try {
    let candidate = target;
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(candidate)).map((part) => [part.type, part.value]));
      const represented = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
      );
      const difference = target - represented;
      if (difference === 0) return new Date(candidate).toISOString();
      candidate += difference;
    }
  } catch {
    return null;
  }

  return null;
}