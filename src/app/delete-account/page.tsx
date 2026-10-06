import type { Metadata } from "next";
import LegalPageShell from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Delete Your Account | PostFlow",
  description: "How to request deletion of your PostFlow account and associated personal data.",
};

export default function DeleteAccountPage() {
  return (
    <LegalPageShell title="Delete Your PostFlow Account">
      <p>You can request deletion of your PostFlow account and associated personal data at any time. PostFlow does not currently provide an instant, self-service account deletion control; deletion requests are verified and processed by an administrator.</p>

      <h2>How to request deletion</h2>
      <ol>
        <li>Send an email from the address associated with your PostFlow account to <a href="mailto:chyt84709@gmail.com?subject=PostFlow%20Account%20Deletion%20Request&body=Account%20email%3A%0AWorkspace%20(if%20known)%3A%0A">chyt84709@gmail.com</a>.</li>
        <li>Use the subject “PostFlow Account Deletion Request” and include your account email, workspace name if known, and whether you want only your account or specific workspace information deleted.</li>
        <li>We may ask you to verify your identity before processing the request. We will review and carry it out for the applicable account or workspace records.</li>
      </ol>

      <h2>What happens to your information</h2>
      <p>We will delete the applicable information unless it must be retained for legal obligations or records reasonably needed for security or dispute resolution. If information must be retained, we will explain why. Deleting PostFlow data does not delete copies already held by social platforms or hosting providers; revoke PostFlow’s authorization in each connected platform’s settings to prevent future access there.</p>

      <p>For details about retention and deletion, see the <a href="/privacy">PostFlow Privacy Policy</a>.</p>
    </LegalPageShell>
  );
}
