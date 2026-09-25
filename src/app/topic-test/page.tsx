import PublicExam from '@/components/public-exams/PublicExam';

export default async function TopicTestPage({ searchParams }: { searchParams: Promise<{ topicId?: string; questionSetId?: string; topic?: string }> }) {
  const { topicId, questionSetId, topic } = await searchParams;
  return <PublicExam mode="topic" topicId={topicId} questionSetId={questionSetId} topic={topic} />;
}
