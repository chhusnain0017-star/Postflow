import { redirect } from "next/navigation";

export default async function RequestAccessPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  redirect(plan ? `/upgrade?plan=${encodeURIComponent(plan)}` : "/upgrade");
}
