export function getAppRedirectUrl(path: string, requestUrl: string, runtimeEnvironment = process.env.NODE_ENV) {
  const requestOrigin = new URL(requestUrl).origin;
  const configuredAppUrl = process.env.APP_URL?.trim();
  if (!configuredAppUrl) return new URL(path, requestOrigin);

  const configuredUrl = new URL(configuredAppUrl);
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(configuredUrl.hostname);
  const baseUrl = runtimeEnvironment === "production" && isLocalhost
    ? requestOrigin
    : configuredUrl.origin;
  return new URL(path, baseUrl);
}