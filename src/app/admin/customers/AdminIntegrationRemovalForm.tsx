"use client";

import { removeCustomerIntegrationCredentialsAction } from "@/app/actions";

export default function AdminIntegrationRemovalForm({
  accountId,
  platform,
  customerEmail,
}: {
  accountId: string;
  platform: string;
  customerEmail: string;
}) {
  return (
    <form
      action={removeCustomerIntegrationCredentialsAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remove ${platform} credentials and locally stored connection tokens for ${customerEmail}? This will not revoke access with ${platform}.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="accountId" value={accountId} />
      <button type="submit" className="secondary-btn">Remove / reset credentials</button>
    </form>
  );
}
