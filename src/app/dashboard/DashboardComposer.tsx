"use client";

import { useState } from "react";
import { createCustomerPost } from "@/app/actions";
import ScheduleFields from "@/app/create-post/ScheduleFields";

type UploadedAsset = { id: string; originalName: string; size: number };

export default function DashboardComposer() {
  const [asset, setAsset] = useState<UploadedAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadVideo(file: File | undefined) {
    if (!file) return;
    setAsset(null);
    setUploadError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/assets?videoOnly=1", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const result = await response.json() as { asset?: UploadedAsset; error?: string };
      if (!response.ok || !result.asset) throw new Error(result.error || "Video upload failed.");
      setAsset(result.asset);
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : "Video upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="dashboard-composer" aria-labelledby="composer-heading">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Create content</p>
          <h2 id="composer-heading">Start with a video</h2>
        </div>
        <a href="/library" className="text-link">Browse library</a>
      </div>

      <label className={`video-upload-box${uploading ? " uploading" : ""}`}>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(event) => void uploadVideo(event.currentTarget.files?.[0])}
          disabled={uploading}
          aria-label="Choose a video file"
        />
        <span className="video-upload-icon" aria-hidden="true"><i /></span>
        <strong>{uploading ? "Uploading your video…" : asset ? asset.originalName : "Choose a video to upload"}</strong>
        <span>{uploading ? "Please keep this page open" : asset ? `${(asset.size / (1024 * 1024)).toFixed(1)} MB · Ready to add` : "MP4, WebM, or MOV · up to 30 MB"}</span>
      </label>
      {uploadError && <p className="form-error" role="alert">{uploadError}</p>}

      <form action={createCustomerPost} className="dashboard-publish-form">
        <input type="hidden" name="requiresVideo" value="yes" />
        <input type="hidden" name="assetIds" value={asset?.id ?? ""} />
        <label>
          <span>Post title</span>
          <input name="title" maxLength={250} placeholder="Give your video a title" required />
        </label>
        <label>
          <span>Video description</span>
          <textarea name="description" rows={4} maxLength={10000} placeholder="Write the description you want to share with your audience…" required />
        </label>
        <fieldset className="dashboard-platforms">
          <legend>Share to</legend>
          <label><input type="checkbox" name="platforms" value="Instagram" /> Instagram</label>
          <label><input type="checkbox" name="platforms" value="YouTube" defaultChecked /> YouTube</label>
          <label><input type="checkbox" name="platforms" value="Facebook" defaultChecked /> Facebook</label>
        </fieldset>
        <ScheduleFields />
        <button type="submit" className="primary-btn publish-schedule-btn" disabled={!asset || uploading}>
          Publish / Schedule
        </button>
        <p className="form-hint">Posts are saved as drafts unless you choose a future schedule. Actual publishing depends on the selected platform’s authorization and availability.</p>
      </form>
    </section>
  );
}
