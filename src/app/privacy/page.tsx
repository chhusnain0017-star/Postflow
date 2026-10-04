import type { Metadata } from "next";
import LegalPageShell from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | PostFlow",
  description: "Learn what information PostFlow collects, how it is used and protected, how long it is kept, and how to request access or deletion.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p><strong>Effective date: October 4, 2026.</strong> This Privacy Policy describes how PostFlow collects, uses, stores, and shares information when you visit the public site, request or accept account access, use a workspace, or connect a social account. It also explains how to contact us about your information.</p>

      <h2>1. Information we collect</h2>
      <p>The information we handle depends on the features you and your workspace administrator use. It may include:</p>
      <ul>
        <li><strong>Account and access information:</strong> name, email address, username, password (stored as a password hash), access-request status, account and workspace identifiers, role, invitation and approval records, and account dates.</li>
        <li><strong>Workspace content:</strong> drafts and post text, captions, hashtags, campaign names, selected platforms, schedules and time zones, approval history, and media or documents you upload. Uploaded-file records can include the original filename, file type, file size, tags, and upload time.</li>
        <li><strong>Team and security records:</strong> team membership and permissions, invitation records, sign-in and session information, OAuth authorization state, and audit events that record administrative or workspace actions.</li>
        <li><strong>Connected social-account information:</strong> the provider account identifier and display name returned during authorization, the permissions (scopes) granted, connection status and time, token expiry information, and OAuth access or refresh tokens needed to maintain the connection.</li>
        <li><strong>Post-performance information:</strong> where provided to the service, the platform, post and campaign association, snapshot time, impressions, reach, video views, likes, comments, shares, saves, and clicks. Workspace reports can be viewed in the app or exported as a CSV by an authorized user.</li>
        <li><strong>Technical information:</strong> information necessary to operate and secure an authenticated web service, such as session-cookie data and information included in service or security events. The application does not currently use advertising or marketing trackers.</li>
      </ul>

      <h2>2. How we use your data</h2>
      <p>We use this information only as needed to provide and administer PostFlow, including to:</p>
      <ul>
        <li>create and administer accounts, workspaces, invitations, roles, and access approvals;</li>
        <li>authenticate users, maintain sessions, and help detect, investigate, or prevent misuse;</li>
        <li>save and organize content, media, schedules, approvals, campaigns, and reports;</li>
        <li>connect a social account when you initiate authorization and perform the action you request for that account;</li>
        <li>display and export workspace post-performance information;</li>
        <li>provide customer support, troubleshoot issues, administer access terms, and protect the service.</li>
      </ul>
      <p>PostFlow does not sell personal information, use it to serve advertising, or use connected-account information for purposes unrelated to the requested service.</p>

      <h2>3. Google and YouTube API data</h2>
      <p>If you choose to connect YouTube, PostFlow sends you to Google’s authorization service. The current Google authorization requests the basic OpenID Connect profile and email scopes and the YouTube upload scope. From Google, PostFlow receives account identity information (such as the Google account identifier and the available name or email), an authorization result, and access and, when returned, refresh tokens. PostFlow records the connected account identity, granted scopes, token expiry, and encrypted tokens so it can show the connection and perform authorized YouTube uploads.</p>
      <p>PostFlow uses Google user data only to identify the account you connected, maintain that connection, and provide the YouTube features you choose to use. When you request a YouTube publishing action, the content and information required for that action are sent to YouTube. A draft is not sent to Google merely because it is saved in PostFlow. PostFlow does not use Google user data for advertising, sell it, or use it to build advertising profiles.</p>
      <p>PostFlow does not currently request Google Analytics access or use the YouTube Analytics API to read channel analytics. Post-performance information shown in PostFlow is stored for the workspace when it is supplied through the app’s authorized metrics-ingestion process; it is not obtained from Google Analytics through the YouTube connection described above.</p>
      <p>PostFlow’s access to and use of information received from Google APIs complies with the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>, including its Limited Use requirements. We do not transfer Google user data to third parties except as necessary to provide or improve the user-facing feature you requested, to comply with law, or as otherwise permitted by that policy. Google processes information under its own terms and privacy policy.</p>

      <h2>4. Sharing and service providers</h2>
      <p>We share information only as needed to run the service or fulfill your instructions:</p>
      <ul>
        <li><strong>Connected platforms:</strong> when you authorize a platform or request an action, the relevant authorization data or selected content is sent to that platform. The destination is the platform you selected; a saved draft is not automatically sent to every connected service.</li>
        <li><strong>Hosting and infrastructure:</strong> PostFlow runs on third-party hosting infrastructure that stores or processes the application and workspace data on our behalf.</li>
        <li><strong>Workspace users and administrators:</strong> authorized users can see information permitted by their workspace role. Workspace administrators may manage membership, access, integrations, and content.</li>
        <li><strong>Legal and safety reasons:</strong> information may be disclosed if required by law or when reasonably necessary to protect users, the service, or legal rights.</li>
      </ul>
      <p>Third-party social platforms and hosting providers have their own privacy practices and terms. PostFlow does not control how a platform uses information after it receives it.</p>

      <h2>5. Storage and security</h2>
      <p>Workspace records and uploaded files are stored in the application’s configured hosting environment. We use reasonable technical and organizational measures to help protect them. In particular:</p>
      <ul>
        <li>passwords are hashed before they are stored;</li>
        <li>social-provider client credentials and OAuth tokens are encrypted using AES-256-GCM with a server-side encryption key;</li>
        <li>the sign-in session is maintained with an HTTP-only cookie, marked secure in production; and</li>
        <li>workspace and account controls restrict access according to account status and role.</li>
      </ul>
      <p>No online service can guarantee absolute security. The security of encrypted credentials depends in part on keeping the server-side encryption key private and available only to authorized operators. If you suspect unauthorized access, contact <a href="mailto:chyt84709@gmail.com">chyt84709@gmail.com</a> and revoke the affected app authorization with the provider.</p>

      <h2>6. Retention and deletion</h2>
      <p>We retain account, workspace, content, integration, and performance records while they are needed to provide PostFlow, administer the workspace, maintain security, and meet applicable legal or operational requirements. The application does not automatically delete a user’s records when access expires or is suspended. Archived content and security or audit records may also remain in the active store until an administrator removes them or a deletion request is completed. We do not claim a fixed automatic deletion period.</p>
      <p>To request deletion, email <a href="mailto:chyt84709@gmail.com">chyt84709@gmail.com</a> from the address associated with your PostFlow account and include your account email, workspace (if known), and the information you want deleted. We may ask for information needed to verify the request. After verification, the administrator will review and carry out the request for the applicable account or workspace records, subject to legal requirements and records reasonably needed for security or dispute resolution. We will explain if any information must be retained. Removing PostFlow data does not remove copies already held by a social platform or hosting provider under its own retention practices.</p>
      <p>You may also revoke PostFlow’s access in the connected provider’s account settings. Revocation prevents future access through that authorization but does not by itself delete records already stored in PostFlow; contact us separately to request deletion.</p>

      <h2>7. Cookies and session management</h2>
      <p>PostFlow uses a first-party HTTP-only session cookie to keep you signed in. It is configured with a seven-day maximum age, and a new sign-in may invalidate the previous session. The application does not currently use advertising cookies or third-party marketing trackers. You can end access by signing out and can also clear cookies in your browser; clearing a cookie does not delete account data.</p>

      <h2>8. Children and payments</h2>
      <p>PostFlow is intended for business/workspace use and is not directed to children under 13. We do not knowingly collect information from children under 13. PostFlow does not process payment-card details in the application or automatically charge subscription fees.</p>

      <h2>9. Your choices and privacy rights</h2>
      <p>Depending on where you live, you may have rights to request access to, correction of, or deletion of your personal information, or to object to or restrict certain processing. You may also disconnect or revoke a social-platform authorization with that platform. To make a privacy request, contact <a href="mailto:chyt84709@gmail.com">chyt84709@gmail.com</a>. We may verify your identity and will respond in accordance with applicable law. You can also contact your workspace administrator for help with account or workspace access.</p>

      <h2>10. Changes to this policy</h2>
      <p>We may update this policy when the service, data practices, provider requirements, or legal obligations change. The current version and effective date will be published on this page. Material changes will be communicated through the service or another appropriate channel where required.</p>

      <h2>11. Contact</h2>
      <p>For questions, access or deletion requests, or other privacy concerns, contact the PostFlow privacy administrator at <a href="mailto:chyt84709@gmail.com">chyt84709@gmail.com</a>.</p>
    </LegalPageShell>
  );
}
