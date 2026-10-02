"use client";

import { useRef } from "react";
import { saveIntegrationConfiguration } from "@/app/actions";
import type { SocialPlatform } from "@/lib/platforms";

export default function IntegrationSetupModal({ platform }: { platform: SocialPlatform }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="primary-btn" onClick={() => dialogRef.current?.showModal()}>Setup required</button>
      <dialog ref={dialogRef} className="integration-dialog" aria-labelledby={`setup-title-${platform}`}>
        <div className="dialog-heading">
          <div><p className="eyebrow">App credentials</p><h2 id={`setup-title-${platform}`}>Set up {platform}</h2></div>
          <button type="button" className="icon-close" aria-label="Close setup" onClick={() => dialogRef.current?.close()}>×</button>
        </div>
        <p className="form-hint">Use the Client ID and Client Secret from your platform developer application. Account access is granted on the next authorization step.</p>
        <form action={saveIntegrationConfiguration} className="form-stack">
          <input type="hidden" name="platform" value={platform} />
          <label><span>{platform === "TikTok" ? "Client Key" : platform === "WhatsApp" ? "Meta App ID" : "Client ID"}</span><input name="clientId" autoComplete="off" required maxLength={512} /></label>
          <label><span>Client Secret</span><input name="clientSecret" type="password" autoComplete="new-password" required maxLength={4096} /></label>
          <div className="dialog-actions">
            <button type="button" className="secondary-btn" onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button type="submit" className="primary-btn">Save credentials</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
