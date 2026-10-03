import type { Metadata } from "next";
import LegalPageShell from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | PostFlow",
  description: "How PostFlow stores and uses account, workspace, integration, and content data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>This policy explains what PostFlow collects, why it collects it, how it protects it, and what choices you have regarding your account, workspaces, and connected social integrations. It applies when you request access, accept an invitation, or use a PostFlow workspace.</p>

      <h2>1. Information we collect</h2>
      <p>PostFlow may collect and store information required to operate the service and keep the workspace secure. This includes:</p>
      <ul>
        <li><strong>Account data:</strong> your name, email address, username, login activity, password hash, status, approved access date, and contract expiry date.</li>
        <li><strong>Workspace and publishing data:</strong> post drafts, captions, hashtags, scheduling details, campaign metadata, review history, platform selections, and uploaded media or files associated with your content library.</li>
        <li><strong>Team and access data:</strong> role assignments, workspace permissions, invites, invitation tokens, security checks, audit logs, and actions taken by administrators or team members.</li>
        <li><strong>Integration credentials and tokens:</strong> client IDs, client secrets, API tokens, refresh tokens, connected account IDs, account names, token expiration dates, granted scope information, and authorization status for social platforms such as Facebook, Instagram, YouTube, TikTok, X, Pinterest, and Threads.</li>
        <li><strong>Analytics and engagement data:</strong> metrics that social platforms provide to PostFlow, such as impressions, reach, views, likes, comments, shares, saves, clicks, and related campaign-record information when those metrics are available.</li>
      </ul>

      <h2>2. How we use your data</h2>
      <p>We use your information to:</p>
      <ul>
        <li>create and maintain your account and authorized workspace access;</li>
        <li>authenticate you, enforce sign-in sessions, and protect against unauthorized use;</li>
        <li>manage invitations, approvals, permissions, and team roles;</li>
        <li>store and organize content, schedules, and campaign settings;</li>
        <li>connect to third-party publishing and analytics platforms with your permission;</li>
        <li>display post performance and engagement data inside the app;</li>
        <li>support troubleshooting, account administration, contract review, and security monitoring.</li>
      </ul>
      <p>PostFlow does not sell personal data and does not currently use third-party advertising trackers on its application pages.</p>

      <h2>3. Data sharing with providers</h2>
      <p>When you connect a social platform, PostFlow may send a request to that provider to authorize access and exchange an authorization code for tokens. If a provider requires posting or analytics permissions, PostFlow may send the relevant content or API request to that provider only for the selected platform and only when the app is configured for that provider.</p>
      <p>Each provider is responsible for its own data handling, identity checks, permissions, and platform terms. PostFlow does not send content to every provider simply because a draft exists in the workspace.</p>

      <h2>4. Data protection and security measures</h2>
      <p>We use reasonable technical and administrative safeguards to reduce the risk of unauthorized access, loss, or misuse of your data. In particular:</p>
      <ul>
        <li>passwords are stored as hashes rather than as plain-text passwords;</li>
        <li>provider secrets and OAuth tokens are encrypted at rest using the server-side encryption key;</li>
        <li>session cookies are HTTP-only and use secure transport in production;</li>
        <li>audit events track workspace security and administrative actions;</li>
        <li>access can be restricted or revoked using account status, contract expiry, or admin controls.</li>
      </ul>
      <p>No online system can guarantee perfect security. If you suspect a compromise, contact the administrator immediately and consider rotating the affected credentials and revoking the relevant app authorization in the provider account.</p>

      <h2>5. Retention and deletion</h2>
      <p>PostFlow keeps records for as long as they are needed to provide the service, maintain security, support contract management, and meet reasonable administrative and operational obligations. Access may be suspended or ended when a contract expires, a user is removed, or an account is no longer approved.</p>
      <p>Contract expiry may block access without immediately deleting all records. Archived or hidden content may remain in storage for operational continuity, and deletion requests are handled by administrator review and platform-specific revocation. If you need a deletion request, data export, access correction, or account-related privacy request, contact the platform administrator using the channel through which access was issued.</p>

      <h2>6. Cookies and session management</h2>
      <p>PostFlow uses an HTTP-only session cookie to keep you signed in and maintain authenticated access during active use. A new sign-in may invalidate the previous session. The app does not currently use advertising cookies or third-party tracking cookies for marketing.</p>

      <h2>7. Children and payments</h2>
      <p>PostFlow is not designed for children under the age of consent in the relevant jurisdiction, and we do not knowingly collect or maintain personal data from children for service use. PostFlow does not currently process payment-card details in the application itself and does not automatically charge subscription fees without administrator coordination.</p>

      <h2>8. Your choices and rights</h2>
      <p>You can review your personal information, connected social accounts, team role, and access status from within the app. If you want to update information, disconnect an integration, or ask for record access or deletion, contact the workspace administrator or the platform administrator through the original invitation or access channel. You may also revoke provider access directly from the relevant social platform.</p>

      <h2>9. Changes to this policy</h2>
      <p>We may update this policy when new features, provider requirements, legal obligations, or security practices change. The current version is available at <a href="/privacy">postflow/privacy</a>. Continued use after an update takes effect means you accept the revised policy.</p>
    </LegalPageShell>
  );
}
