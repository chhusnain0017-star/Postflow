"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FacebookPage = { id: string; name: string };

export default function FacebookPagePicker() {
  const router = useRouter();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/integrations/facebook/pages")
      .then(async (response) => {
        const result = await response.json() as { pages?: FacebookPage[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load Facebook Pages.");
        if (active) {
          setPages(result.pages ?? []);
          setSelectedPage(result.pages?.[0]?.id ?? "");
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load Facebook Pages.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function connectPage() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/integrations/facebook/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: selectedPage }),
      });
      const result = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error || "Could not connect this Page.");
      router.push("/integrations?connection=connected");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect this Page.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="form-hint" role="status">Loading Pages available to your Facebook account…</p>;
  if (error && pages.length === 0) return <p className="form-error" role="alert">{error}</p>;
  if (pages.length === 0) {
    return (
      <div className="facebook-page-empty">
        <p>No Facebook Pages were found for this account.</p>
        <p>Make sure you have a Page and that your account has permission to manage it, then reconnect Facebook and try again.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="form-stack facebook-page-form">
      <label>
        <span>Choose the Page to connect</span>
        <select value={selectedPage} onChange={(event) => setSelectedPage(event.target.value)}>
          {pages.map((page) => <option key={page.id} value={page.id}>{page.name}</option>)}
        </select>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="button" className="primary-btn" disabled={!selectedPage || submitting} onClick={connectPage}>
        {submitting ? "Connecting Page..." : "Connect selected Page"}
      </button>
    </div>
  );
}
