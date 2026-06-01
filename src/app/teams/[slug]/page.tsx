import { redirect } from "next/navigation";

export default async function TeamsSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/roster/${slug}`);
}
