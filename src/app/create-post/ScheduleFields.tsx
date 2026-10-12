"use client";

import { useEffect, useRef } from "react";

export default function ScheduleFields() {
  const timeZoneInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timeZoneInput.current) {
      timeZoneInput.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    }
  }, []);

  return (
    <>
      <label>
        <span>Schedule for</span>
        <input type="datetime-local" name="scheduledAt" />
      </label>
      <input ref={timeZoneInput} type="hidden" name="timeZone" defaultValue="UTC" />
      <p className="form-hint">Scheduled time uses your device timezone.</p>
    </>
  );
}