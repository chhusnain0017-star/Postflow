export type PlatformName = "Facebook" | "Instagram" | "YouTube" | "TikTok" | "X" | "Pinterest" | "Threads";

export const platformCatalog: Array<{ name: PlatformName; requiresReview: boolean; notes: string }> = [
  { name: "Facebook", requiresReview: false, notes: "Requires Page access token and content policy validation." },
  { name: "Instagram", requiresReview: true, notes: "Requires linked Facebook Page and Instagram Business account approval." },
  { name: "YouTube", requiresReview: false, notes: "Uses YouTube Data API and channel-level permissions." },
  { name: "TikTok", requiresReview: true, notes: "Requires business account and app review for posting permissions." },
  { name: "X", requiresReview: false, notes: "Supports text and media posting with rate-limit-aware retries." },
  { name: "Pinterest", requiresReview: false, notes: "Requires board access and media validation." },
  { name: "Threads", requiresReview: true, notes: "Platform access is governed by approved applications and API scope requirements." },
];

export function getPlatformRequirement(name: PlatformName) {
  return platformCatalog.find((platform) => platform.name === name) ?? null;
}
