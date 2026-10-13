This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

For local development, open [http://localhost:3000](http://localhost:3000). Production: [https://postflow.taskflow.monster](https://postflow.taskflow.monster).

The public account-deletion request page is [https://postflow.taskflow.monster/delete-account](https://postflow.taskflow.monster/delete-account). Requests are verified and processed by an administrator; there is currently no instant, self-service deletion control.

## Provider setup and account terms

Set `APP_URL=https://postflow.taskflow.monster` in Railway. Use the public homepage `https://postflow.taskflow.monster` as the TikTok app's Website URL; it is a public product page, not the sign-in screen. The Privacy Policy and Terms of Service are linked from the homepage and are available without signing in:

```text
https://postflow.taskflow.monster/privacy
https://postflow.taskflow.monster/terms
```

For Google sign-in, open the Google Cloud Console OAuth 2.0 Web client that matches `GOOGLE_CLIENT_ID` and register this exact Authorized redirect URI:

```text
https://postflow.taskflow.monster/api/auth/google/callback
```

The same Google client also needs this Authorized redirect URI for YouTube account connections:

```text
https://postflow.taskflow.monster/api/integrations/callback
```

The redirect URI must match exactly, including `https`, hostname, and path. A Google `Error 400: redirect_uri_mismatch` means the URI sent by the app is missing from that OAuth client or does not match; verify Railway's `APP_URL` is exactly `https://postflow.taskflow.monster` and save the Google client changes.

Configure each provider app once in Railway using the server-side environment variables below. Customers then click the provider's Connect button and authorize their own account; they must never enter the developer app's Client ID or Secret. Keep all secrets private and set `ENCRYPTION_KEY` to a stable value.

| Provider | Railway variables |
| --- | --- |
| Facebook and Instagram | `META_CLIENT_ID`, `META_CLIENT_SECRET` |
| YouTube | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| TikTok | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` |
| X | `X_CLIENT_ID`, `X_CLIENT_SECRET` |
| Pinterest | `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET` |
| Threads | `THREADS_CLIENT_ID`, `THREADS_CLIENT_SECRET` |

The OAuth callback URL must be registered in each provider app. For Meta, add the Facebook Login and Instagram products and configure the applicable redirect URI, products, and approved permissions. Meta review and permission approval are controlled by Meta and cannot be bypassed by PostFlow.

WhatsApp uses Meta Embedded Signup, not the standard OAuth redirect. Set `WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID` in Railway and use the Meta App ID that owns that signup configuration. Meta app review, WhatsApp Business permissions, a working webhook, a WABA phone number, and its six-digit registration PIN are required before the app can show Connected.

Customer and team access lasts through the next calendar anniversary of activation. Expired accounts are blocked until an administrator confirms renewal; payment collection is not configured in PostFlow, so administrators renew access manually after payment.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
