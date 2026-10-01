export default function WaitingPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Approval status</p>
        <h1>Your request is pending</h1>
        <p>Your account is waiting for administrator approval. Please contact the platform owner if needed.</p>
        <a href="/" className="primary-btn inline-link">Back home</a>
      </section>
    </main>
  );
}
