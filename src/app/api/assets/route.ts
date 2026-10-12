import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/access";
import { getAssetStorageDir, readStore, writeStore } from "../../../../tests/store";
import { addAuditLog } from "../../../../tests/store";

export const runtime = "nodejs";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "application/pdf": "pdf",
};
const maxFileSize = 30 * 1024 * 1024;

function uploadError(request: Request, message: string) {
  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const url = new URL("/library", request.url);
  const destination = new URL(request.url).searchParams.get("returnTo");
  if (destination === "/dashboard") url.pathname = "/dashboard";
  url.searchParams.set("uploadError", message);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const user = await requireCustomer();
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > maxFileSize) {
    return uploadError(request, "Choose a file smaller than 30 MB.");
  }

  const extension = allowedTypes[file.type];
  if (!extension) return uploadError(request, "Supported files: images, MP4/WebM/MOV video, MP3/WAV audio, or PDF.");
  if (new URL(request.url).searchParams.get("videoOnly") === "1" && !file.type.startsWith("video/")) {
    return uploadError(request, "Choose an MP4, WebM, or MOV video file.");
  }

  const id = `asset-${randomUUID()}`;
  const storageKey = `${randomUUID()}.${extension}`;
  const directory = getAssetStorageDir();
  const filePath = join(/* turbopackIgnore: true */ directory, storageKey);
  const tags = String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim().slice(0, 32)).filter(Boolean).slice(0, 10);

  await mkdir(directory, { recursive: true });
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  try {
    const store = readStore();
    const asset = {
      id,
      workspaceId: user.workspaceId,
      uploadedById: user.id,
      originalName: file.name.slice(0, 240),
      mimeType: file.type,
      size: file.size,
      tags,
      storageKey,
      createdAt: new Date().toISOString(),
    };
    store.assets.push(asset);
    writeStore(store);
    addAuditLog({ workspaceId: user.workspaceId, userId: user.id, event: "Asset Uploaded", details: `${file.name.slice(0, 180)} (${file.size} bytes)` });
    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({
        asset: { id: asset.id, originalName: asset.originalName, mimeType: asset.mimeType, size: asset.size },
      }, { status: 201 });
    }
  } catch (error) {
    await unlink(filePath).catch(() => undefined);
    throw error;
  }

  return NextResponse.redirect(new URL("/library", request.url), { status: 303 });
}
