"use client";

import { useEffect, useState } from "react";

export default function ScheduleFields() {
  const [timeZone, setTimeZone] = useState("UTC");

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);

  return (
    <>
      <label>
        <span>Schedule for</span>
        <input type="datetime-local" name="scheduledAt" />
      </label>
      <input type="hidden" name="timeZone" value={timeZone} />
      <p className="form-hint">Scheduled time uses your device timezone.</p>
    </>
  );
}