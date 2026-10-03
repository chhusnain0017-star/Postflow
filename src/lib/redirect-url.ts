function normalizeUrlCandidate(input?: string) {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  return trimmed.includes("://") ? trimmed : `https://${trimmed}`;
}

export function getAppRedirectUrl(path: string, requestUrl: string, runtimeEnvironment = process.env.NODE_ENV) {
  const requestOrigin = new URL(requestUrl).origin;
  const configuredAppUrl = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.PUBLIC_URL,
    normalizeUrlCandidate(process.env.RAILWAY_PUBLIC_DOMAIN),
    normalizeUrlCandidate(process.env.RAILWAY_STATIC_URL),
  ].find((candidate): candidate is string => Boolean(candidate && candidate.trim()));

  if (!configuredAppUrl) return new URL(path, requestOrigin);

  const configuredUrl = new URL(configuredAppUrl);
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(configuredUrl.hostname);
  const baseUrl = runtimeEnvironment === "production" && isLocalhost
    ? requestOrigin
    : configuredUrl.origin;
  return new URL(path, baseUrl);
}