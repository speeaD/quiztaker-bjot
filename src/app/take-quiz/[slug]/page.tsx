// src/app/take-quiz/[slug]/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TakeQuizScreen from '@/components/TakeQuiz';
import type { QuizDetailsResponse } from '@/types/global';

interface PageProps {
  params: Promise<{
    slug: string;  // Must match folder name: [slug]
  }>;
}

async function getQuizTakerData() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    redirect('/login');
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/quiztaker/dashboard`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch quiz taker data');
    }

    const data = await response.json();
    console.log('Quiz taker ID:', data.quizTaker.id);
    return data.quizTaker.id;
  } catch (error) {
    console.error('Error fetching quiz taker:', error);
    redirect('/dashboard');
  }
}

async function getQuizDetails(quizId: string, quizTakerId: string) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    redirect('/login');
  }

  console.log('Fetching quiz details for quizId:', quizId, 'quizTakerId:', quizTakerId);

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/quiztaker/quiz/${quizId}`,
      {
        method: 'GET',  // Changed to POST to send quizTaker in body
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        credentials: 'include',
      }
    );

    console.log('Fetch quiz details response status:', response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Quiz fetch error:', errorText);
      throw new Error('Failed to fetch quiz details');
    }

    const data: QuizDetailsResponse = await response.json();
    console.log('Fetched quiz details:', data);
    return data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    redirect('/dashboard');
  }
}

export default async function TakeQuizPage({ params }: PageProps) {
  // IMPORTANT: In Next.js 15, params is a Promise and must be awaited
  const { slug } = await params;
  
  console.log('Quiz ID from params:', slug);
  
  // Fetch quiz taker ID first
  const quizTakerId = await getQuizTakerData();
  
  // Then fetch quiz details, passing slug as quizId
  const quizData = await getQuizDetails(slug, quizTakerId);

  return <TakeQuizScreen initialQuizData={quizData} quizTakerId={quizTakerId} />;
}