import { requireCustomer } from "@/lib/access";
import { createCustomerPost } from "@/app/actions";
import { SOCIAL_PLATFORMS } from "@/lib/platforms";
import ScheduleFields from "@/app/create-post/ScheduleFields";
import CustomerNav from "@/app/components/CustomerNav";
import { readStore } from "@/lib/store";

export default async function CreatePostPage() {
  const user = await requireCustomer();
  const assets = readStore().assets.filter((asset) => asset.workspaceId === user.workspaceId && !asset.archivedAt);

  return (
    <main className="app-shell">
      <CustomerNav active="create-post" role={user.role} />
      <section className="content-panel">
        <h1>Create post</h1>
        <form action={createCustomerPost} className="form-stack big-form">
          <label>
            <span>Campaign name</span>
            <input name="campaignName" maxLength={120} placeholder="Optional campaign grouping" />
          </label>
          <label>
            <span>Title</span>
            <input name="title" required />
          </label>
          <label>
            <span>Description</span>
            <textarea name="description" rows={5} required />
          </label>
          <label>
            <span>Hashtags</span>
            <input name="hashtags" placeholder="#launch #social #creator" />
          </label>
          <ScheduleFields />
          {assets.length > 0 && (
            <fieldset className="asset-attachments">
              <legend>Library assets</legend>
              {assets.map((asset) => (
                <label key={asset.id} className="checkbox-option">
                  <input type="checkbox" name="assetIds" value={asset.id} />
                  {asset.originalName}
                </label>
              ))}
            </fieldset>
          )}
          <div className="platform-selection">
            {SOCIAL_PLATFORMS.map((platform) => (
              <label key={platform} className="checkbox-option">
                <input type="checkbox" name="platforms" value={platform} defaultChecked={platform === "Facebook" || platform === "YouTube"} />
                {platform}
              </label>
            ))}
          </div>
          <p className="form-notice">Social publishing will be available after platform OAuth is configured. Your submission is saved as a draft.</p>
          <button type="submit" className="primary-btn">Save draft</button>
        </form>
      </section>
    </main>
  );
}
