import Image from "next/image";
import { archiveAssetAction } from "@/app/actions";
import CustomerNav from "@/app/components/CustomerNav";
import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ uploadError?: string }> }) {
  const user = await requireCustomer();
  const { uploadError } = await searchParams;
  const assets = readStore().assets.filter((asset) => asset.workspaceId === user.workspaceId && !asset.archivedAt)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

  return (
    <main className="app-shell">
      <CustomerNav active="library" role={user.role} />
      <section className="content-panel">
        <p className="eyebrow">Workspace assets</p>
        <h1>Content library</h1>
        {uploadError && <p className="form-error" role="alert">{uploadError}</p>}
        <form action="/api/assets" method="POST" encType="multipart/form-data" className="asset-upload-form">
          <label><span>Choose file</span><input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,application/pdf" required /></label>
          <label><span>Tags</span><input name="tags" maxLength={320} placeholder="campaign, product, launch" /></label>
          <button type="submit" className="primary-btn">Upload asset</button>
          <p className="form-hint">Images, video, audio, and PDF up to 30 MB. Files are stored on the app data volume.</p>
        </form>

        {assets.length === 0 ? <p className="empty-state">Your library is empty. Upload an asset to start a campaign.</p> : (
          <div className="asset-grid">
            {assets.map((asset) => {
              const src = `/api/assets/${encodeURIComponent(asset.id)}`;
              return (
                <article key={asset.id} className="asset-item">
                  <div className="asset-preview">
                    {asset.mimeType.startsWith("image/") ? <Image src={src} alt={asset.originalName} width={480} height={300} unoptimized />
                      : asset.mimeType.startsWith("video/") ? <video src={src} controls preload="metadata" />
                        : asset.mimeType.startsWith("audio/") ? <audio src={src} controls preload="metadata" />
                          : <a href={src} target="_blank" rel="noreferrer">Open PDF</a>}
                  </div>
                  <div className="asset-details">
                    <strong title={asset.originalName}>{asset.originalName}</strong>
                    <span>{(asset.size / (1024 * 1024)).toFixed(1)} MB · {new Date(asset.createdAt).toLocaleDateString()}</span>
                    <span>{asset.tags.join(" · ") || "Untagged"}</span>
                  </div>
                  <form action={archiveAssetAction}>
                    <input type="hidden" name="assetId" value={asset.id} />
                    <button type="submit" className="secondary-btn">Archive</button>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}