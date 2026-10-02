import type { Metadata } from "next";
import LegalPageShell from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service | PostFlow",
  description: "Terms governing use of the PostFlow workspace and connected services.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service">
      <p>These terms govern your use of PostFlow. By requesting access, accepting an invitation, or using an approved account, you agree to these terms and the <a href="/privacy">Privacy Policy</a>. If you do not agree, do not use the service.</p>

      <h2>1. Access and account security</h2>
      <p>Access is limited to accounts approved by the platform administrator. Keep your password and invitation details private, use your account only for yourself, and tell the administrator promptly if you suspect unauthorized access. One active session is allowed per account; a new sign-in may end an existing session.</p>

      <h2>2. Contract term and renewal</h2>
      <p>Customer access is granted for one year beginning on the date the administrator approves and activates the account. Team-member access begins when the invitation is accepted. Access ends on the next calendar anniversary. On expiry, access is stopped until the administrator confirms renewal.</p>
      <p>PostFlow does not currently process payments or automatically charge for renewal. Contact the administrator to arrange payment. An administrator may renew access after confirming payment; the next one-year term then begins on the renewal date.</p>

      <h2>3. Social accounts and integrations</h2>
      <p>You authorize providers through their own authorization screens and are responsible for selecting the correct accounts, business assets, permissions, and publishing destinations. A platform connection is tied to this PostFlow account and cannot be replaced through the app; a different account may require a new PostFlow account. You may also need to revoke access directly with the platform.</p>
      <p>Entering a Client ID and Client Secret only saves app configuration; it does not itself connect a social account. Provider approval, valid callback configuration, consent, and any platform-specific setup are required. Third-party platforms control their APIs, scopes, review, availability, limits, and terms.</p>

      <h2>4. Content, scheduling, and publishing</h2>
      <p>You retain ownership of content you upload. You give PostFlow permission to store and process it only to provide the workspace features you request. You must have the rights and permissions needed for your content and for each selected platform.</p>
      <p>PostFlow may save drafts and scheduled queue entries. Automatic publishing is available only where a verified provider publishing connection and supported publishing workflow are configured. A queued or scheduled entry is not proof that a platform received or published the content. Check the platform account for final publishing status.</p>

      <h2>5. Team roles and approvals</h2>
      <p>Workspace owners and administrators manage membership and roles. Editors and members may submit posts for review; eligible approvers can approve or return them to drafts. Do not share invitation links: they are single-use and expire. Workspace administrators are responsible for assigning appropriate roles and reviewing team activity.</p>

      <h2>6. Acceptable use</h2>
      <p>Do not use PostFlow to violate law, platform terms, intellectual-property rights, privacy rights, or safety rules. Do not attempt to bypass access controls, interfere with the service, or submit credentials belonging to someone else without authorization.</p>

      <h2>7. Service availability and limitations</h2>
      <p>PostFlow depends on hosting infrastructure and third-party platforms and may be unavailable or changed. We do not guarantee uninterrupted service, platform approval, delivery time, audience reach, engagement, or business results. You remain responsible for reviewing scheduled content and confirming publication with each provider.</p>

      <h2>8. Suspension and termination</h2>
      <p>Access may be suspended or ended if a contract expires, these terms are violated, a provider requires it, or the administrator determines it is necessary to protect a workspace or the service. Contact the administrator for access, renewal, or account concerns.</p>

      <h2>9. Changes and contact</h2>
      <p>These terms may be updated as features or provider requirements change. The current version is available at <a href="/terms">postflow/terms</a>. For questions, renewal, or account requests, contact the platform administrator using the contact channel through which your access was issued.</p>
    </LegalPageShell>
  );
}
