import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
    { params }: { params: Promise<{ id: string; order: string }> }
) {
  try {
    const { id: quizId, order: questionSetOrder } = await params;
    
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `http://localhost:5004/api/quiztaker/quiz/${quizId}/question-set/${questionSetOrder}/start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      }
    );

    

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error starting question set:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to start question set' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error starting question set:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}