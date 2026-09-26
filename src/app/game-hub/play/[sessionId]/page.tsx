import GamePlay from '@/components/games/GamePlay';
export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  return <GamePlay sessionId={(await params).sessionId} />;
}
