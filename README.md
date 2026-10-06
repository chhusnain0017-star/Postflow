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

Set `APP_URL=https://postflow.taskflow.monster` in Railway. Register this exact redirect URI with each standard OAuth provider:

```text
https://postflow.taskflow.monster/api/integrations/callback
```

Configure each provider app's approved scopes and redirect URI before customers authorize it. Saved Client IDs and secrets and returned OAuth tokens are encrypted with `ENCRYPTION_KEY`; keep that key stable and private.

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
