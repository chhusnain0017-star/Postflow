import type { Metadata } from "next";
import LegalPageShell from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service | PostFlow",
  description: "Terms governing use of the PostFlow workspace and connected services.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service">
      <p>These terms govern your use of PostFlow. By signing in with Google, accepting an invitation, requesting a subscription, or using a workspace, you agree to these terms and the <a href="/privacy">Privacy Policy</a>. If you do not agree, do not use the service.</p>

      <h2>1. Access and account security</h2>
      <p>Customer sign-in uses a Google account with a verified email address. Keep your Google account and invitation details private, use your account only for yourself, and tell the administrator promptly if you suspect unauthorized access. One active session is allowed per account; a new sign-in may end an existing session.</p>

      <h2>2. Contract term and renewal</h2>
      <p>A new customer account receives a seven-day free trial beginning at the first successful Google sign-in. Trial access ends exactly seven days later. On expiry, workspace access is stopped until a subscription is arranged. Team-member access is subject to the workspace owner’s active access.</p>
      <p>Subscription requests are available for one-month, six-month, and one-year periods. PostFlow does not currently process online payments or automatically charge for renewal. Submitting a request is not a payment or activation; PostFlow will contact you within 24 hours to discuss processing the selected subscription.</p>

      <h2>3. Social accounts and integrations</h2>
      <p>You authorize providers through their own authorization screens and are responsible for selecting the correct accounts, business assets, permissions, and publishing destinations. Customers cannot replace saved platform credentials themselves. An administrator may remove the saved credentials and locally stored tokens so the integration can be configured again; this does not revoke access with the provider, which may need to be revoked separately.</p>
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
