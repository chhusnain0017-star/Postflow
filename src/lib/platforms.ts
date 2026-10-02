export const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram",
  "YouTube",
  "TikTok",
  "X",
  "Pinterest",
  "Threads",
  "WhatsApp",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export function isSocialPlatform(value: string): value is SocialPlatform {
  return SOCIAL_PLATFORMS.some((platform) => platform === value);
}