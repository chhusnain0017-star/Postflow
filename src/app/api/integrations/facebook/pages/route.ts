import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/access";
import { decryptOAuthTokens, encryptOAuthTokens } from "@/lib/auth";
import { addAuditLog, readStore, writeStore } from "../../../../../../tests/store";

export const runtime = "nodejs";

type FacebookPage = { id: string; name: string; access_token: string };

function graphVersion() {
  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v25.0";
  if (!/^v\d+\.\d+$/.test(version)) throw new Error("META_GRAPH_API_VERSION is invalid.");
  return version;
}

async function getAuthorizedPages(userToken: string): Promise<FacebookPage[]> {
  const pages: FacebookPage[] = [];
  let next: URL | null = new URL(`https://graph.facebook.com/${graphVersion()}/me/accounts`);
  next.searchParams.set("fields", "id,name,access_token");
  next.searchParams.set("limit", "100");

  while (next) {
    const response = await fetch(next, {
      headers: { Authorization: `Bearer ${userToken}` },
      signal: AbortSignal.timeout(20000),
    });
    const payload = await response.json() as { data?: FacebookPage[]; paging?: { next?: string }; error?: { message?: string } };
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message || "Facebook could not return the Pages for this account.");
    }
    pages.push(...(payload.data ?? []).filter((page) => page.id && page.name && page.access_token));
    const nextUrl = payload.paging?.next;
    if (!nextUrl) {
      next = null;
    } else {
      const parsed = new URL(nextUrl);
      if (parsed.protocol !== "https:" || parsed.hostname !== "graph.facebook.com") {
        throw new Error("Facebook returned an invalid Page-list continuation URL.");
      }
      parsed.searchParams.delete("access_token");
      next = parsed;
    }
  }
  return pages;
}

export async function GET() {
  const user = await requireCustomer();
  const account = readStore().socialAccounts.find(
    (entry) => entry.workspaceId === user.workspaceId && entry.platform === "Facebook",
  );
  if (!account?.pageSelectionRequired || !account.accessTokenEncrypted) {
    return NextResponse.json({ error: "Authorize Facebook before choosing a Page." }, { status: 409 });
  }

  try {
    const token = decryptOAuthTokens(account.accessTokenEncrypted).accessToken;
    const pages = await getAuthorizedPages(token);
    return NextResponse.json({ pages: pages.map(({ id, name }) => ({ id, name })) });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to load Facebook Pages.",
    }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const user = await requireCustomer();
  const body = await request.json() as { pageId?: unknown };
  const pageId = typeof body.pageId === "string" ? body.pageId.trim() : "";
  if (!pageId || pageId.length > 200) {
    return NextResponse.json({ error: "Choose a valid Facebook Page." }, { status: 400 });
  }

  const store = readStore();
  const account = store.socialAccounts.find(
    (entry) => entry.workspaceId === user.workspaceId && entry.platform === "Facebook",
  );
  if (!account?.pageSelectionRequired || !account.accessTokenEncrypted) {
    return NextResponse.json({ error: "Authorize Facebook before choosing a Page." }, { status: 409 });
  }

  try {
    const userToken = decryptOAuthTokens(account.accessTokenEncrypted).accessToken;
    const page = (await getAuthorizedPages(userToken)).find((entry) => entry.id === pageId);
    if (!page) return NextResponse.json({ error: "That Page is not available to the authorized Facebook account." }, { status: 403 });

    account.providerUserId = page.id;
    account.accountName = page.name;
    account.accessTokenEncrypted = encryptOAuthTokens({ accessToken: page.access_token });
    account.connected = true;
    account.pageSelectionRequired = false;
    account.connectedAt = new Date().toISOString();
    writeStore(store);
    addAuditLog({
      workspaceId: user.workspaceId,
      userId: user.id,
      event: "Social Account Connected",
      details: `Facebook Page connected: ${page.name}`,
    });
    return NextResponse.json({ success: true, pageName: page.name });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to connect that Facebook Page.",
    }, { status: 502 });
  }
}
