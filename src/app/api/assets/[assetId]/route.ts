import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/access";
import { getAssetStorageDir, readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const user = await requireCustomer();
  const { assetId } = await params;
  const asset = readStore().assets.find((entry) => entry.id === assetId
    && entry.workspaceId === user.workspaceId && !entry.archivedAt);
  if (!asset || !/^asset-[0-9a-f-]+$/.test(asset.id) || !/^[0-9a-f-]+\.(jpg|png|webp|gif|mp4|webm|mov|mp3|wav|pdf)$/.test(asset.storageKey)) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  try {
    const bytes = await readFile(join(/* turbopackIgnore: true */ getAssetStorageDir(), asset.storageKey));
    const safeName = asset.originalName.replace(/[\r\n"\\]/g, "_");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": asset.mimeType,
        "Content-Length": String(asset.size),
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Asset file is missing" }, { status: 404 });
  }
}
