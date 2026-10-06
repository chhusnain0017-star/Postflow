import { SOCIAL_PLATFORMS, type SocialPlatform } from "./platforms.ts";

export type OAuthProviderConfig = {
  authorizationUrl: string;
  tokenUrl: string;
  profileUrl: string;
  clientIdParameter: string;
  scopes: string[];
  pkce: boolean;
  tokenMethod: "GET" | "POST";
};

const configurations: Partial<Record<SocialPlatform, OAuthProviderConfig>> = {
  Facebook: {
    authorizationUrl: "https://www.facebook.com/v25.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v25.0/oauth/access_token",
    profileUrl: "https://graph.facebook.com/v25.0/me?fields=id,name",
    clientIdParameter: "client_id",
    scopes: ["public_profile"],
    pkce: false,
    tokenMethod: "GET",
  },
  Instagram: {
    authorizationUrl: "https://www.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    profileUrl: "https://graph.instagram.com/v1.0/me?fields=user_id,username",
    clientIdParameter: "client_id",
    scopes: ["instagram_business_basic", "instagram_business_content_publish"],
    pkce: false,
    tokenMethod: "POST",
  },
  YouTube: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    profileUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    clientIdParameter: "client_id",
    scopes: ["openid", "profile", "email", "https://www.googleapis.com/auth/youtube.upload"],
    pkce: true,
    tokenMethod: "POST",
  },
  TikTok: {
    authorizationUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    profileUrl: "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username",
    clientIdParameter: "client_key",
    scopes: ["user.info.basic", "video.publish"],
    pkce: false,
    tokenMethod: "POST",
  },
  X: {
    authorizationUrl: "https://x.com/i/oauth2/authorize",
    tokenUrl: "https://api.x.com/2/oauth2/token",
    profileUrl: "https://api.x.com/2/users/me?user.fields=name,username",
    clientIdParameter: "client_id",
    scopes: ["users.read", "tweet.read", "tweet.write", "media.write", "offline.access"],
    pkce: true,
    tokenMethod: "POST",
  },
  Pinterest: {
    authorizationUrl: "https://www.pinterest.com/oauth/",
    tokenUrl: "https://api.pinterest.com/v5/oauth/token",
    profileUrl: "https://api.pinterest.com/v5/user_account",
    clientIdParameter: "client_id",
    scopes: ["user_accounts:read", "boards:read", "pins:read", "pins:write"],
    pkce: false,
    tokenMethod: "POST",
  },
  Threads: {
    authorizationUrl: "https://threads.net/oauth/authorize",
    tokenUrl: "https://graph.threads.net/oauth/access_token",
    profileUrl: "https://graph.threads.net/v1.0/me?fields=id,username",
    clientIdParameter: "client_id",
    scopes: ["threads_basic", "threads_content_publish", "threads_manage_insights"],
    pkce: false,
    tokenMethod: "POST",
  },
};

export function getSocialPlatform(value: string): SocialPlatform | null {
  return SOCIAL_PLATFORMS.find((platform) => platform.toLowerCase() === value.toLowerCase()) ?? null;
}

export function getOAuthProviderConfig(platform: SocialPlatform) {
  return configurations[platform] ?? null;
}

export function createAuthorizationUrl(
  platform: SocialPlatform,
  clientId: string,
  redirectUri: string,
  state: string,
  codeChallenge?: string,
) {
  const config = getOAuthProviderConfig(platform);
  if (!config) throw new Error(`${platform} requires its dedicated account signup flow.`);

  const url = new URL(config.authorizationUrl);
  url.searchParams.set(config.clientIdParameter, clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  const scopeSeparator = ["Facebook", "Instagram", "TikTok", "Pinterest"].includes(platform) ? "," : " ";
  url.searchParams.set("scope", config.scopes.join(scopeSeparator));
  if (platform === "YouTube") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("include_granted_scopes", "true");
  }
  if (platform === "TikTok") url.searchParams.set("disable_auto_auth", "1");
  if (config.pkce) {
    if (!codeChallenge) throw new Error("This platform requires PKCE.");
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url;
}
