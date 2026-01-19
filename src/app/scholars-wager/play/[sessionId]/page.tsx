import GamePlay from '@/components/scholars-wager/GamePlay';


export default async function PlayPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params;
    return <GamePlay sessionId={sessionId} />;
}
