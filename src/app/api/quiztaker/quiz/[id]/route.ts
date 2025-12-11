import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;
    
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get quizTaker ID from query params
    const quizTakerId = localStorage.getItem('quizTakerId');
    
    if (!quizTakerId) {
      return NextResponse.json(
        { error: 'Quiz taker ID is required' },
        { status: 400 }
      );
    }

    // Make request to your backend - Note: Using POST instead of GET to send body
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/quiztaker/quiz/${quizId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          quizTaker: quizTakerId,
        }),
        cache: 'no-store',
      }
    );
    console.log('Fetch quiz response:', response);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch quiz' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}