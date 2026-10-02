import type { Metadata } from "next";
import LegalPageShell from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | PostFlow",
  description: "How PostFlow stores and uses account, workspace, integration, and content data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>This policy describes how PostFlow handles information when you request access or use a PostFlow workspace. It reflects the features currently present in the app and may be updated when new services are added.</p>

      <h2>1. Information stored</h2>
      <ul>
        <li><strong>Account information:</strong> name, username, email, password hash, access status, contract dates, session identifiers, and login timestamps.</li>
        <li><strong>Workspace content:</strong> post titles, descriptions, hashtags, selected platforms, campaign and schedule details, review history, and files you upload to the content library.</li>
        <li><strong>Integration information:</strong> provider app IDs and secrets you submit, authorization tokens after consent, connected account identifiers, token expiry, and granted permissions.</li>
        <li><strong>Team and security records:</strong> role assignments, hashed invitation tokens, audit events, and actions needed to protect the workspace.</li>
        <li><strong>Analytics:</strong> provider metrics associated with a published post, such as impressions, reach, views, likes, comments, shares, saves, and clicks, when a provider supplies them.</li>
      </ul>

      <h2>2. How information is used</h2>
      <p>Information is used to operate authentication and access approval, administer one-year contracts, secure workspaces, store content and schedules, enforce team roles and approvals, complete provider authorization, display provider metrics, and provide support. PostFlow does not currently use third-party advertising or analytics trackers.</p>

      <h2>3. Provider sharing</h2>
      <p>When you choose to connect a provider, the app sends authorization requests to that provider and may exchange authorization codes for tokens. If publishing or metrics APIs are enabled, the relevant content or API requests are sent to the provider you selected. Each provider handles information under its own policies and terms. PostFlow does not send content to every provider merely because you create a draft.</p>

      <h2>4. Storage and security</h2>
      <p>Application records and uploaded files are stored on the deployment's persistent data volume. Provider app credentials and OAuth tokens are encrypted at rest using the server-side ENCRYPTION_KEY. Passwords are stored as hashes, not as readable passwords. Session cookies are HTTP-only and use secure transport in production.</p>
      <p>No internet service can promise absolute security. Protect your password, do not share invitation links, and contact the administrator if you suspect that credentials or a connected account have been exposed.</p>

      <h2>5. Retention and deletion</h2>
      <p>Workspace records are retained while needed to operate the account, maintain security and review history, and meet administrative obligations. Expiring a contract blocks access but does not automatically erase workspace records. Archiving an asset hides it from the active library; it does not currently delete the underlying file. To request deletion or revoke a provider connection, contact the platform administrator and revoke access with the provider where appropriate.</p>

      <h2>6. Cookies and sessions</h2>
      <p>PostFlow uses an HTTP-only session cookie to maintain sign-in. A new sign-in may invalidate the previous session for that account. The app does not currently use advertising cookies.</p>

      <h2>7. Payments and minors</h2>
      <p>PostFlow does not currently collect payment-card details or automatically charge subscription fees. Renewal is coordinated with the administrator. The service is not designed for children.</p>

      <h2>8. Your choices and contact</h2>
      <p>You can review your profile and connected integrations within the app. For access, correction, export, deletion, contract, or privacy requests, contact the platform administrator using the contact channel through which your access was issued. You may also revoke authorization directly with a social platform.</p>

      <h2>9. Changes to this policy</h2>
      <p>This policy may change when the service or its providers change. The latest version is available at <a href="/privacy">postflow/privacy</a>. Continued use after an updated policy takes effect is subject to the revised policy.</p>
    </LegalPageShell>
  );
}
