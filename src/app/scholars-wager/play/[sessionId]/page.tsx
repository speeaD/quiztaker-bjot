import { redirect } from 'next/navigation';
export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  redirect(`/game-hub/play/${(await params).sessionId}`);
}
