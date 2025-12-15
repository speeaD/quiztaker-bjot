/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

interface SubmitQuizBody {
  answers: Array<{
    questionId: string;
    answer: any;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    
    console.log('Submit API - Quiz ID:', quizId);
    
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      console.error('Submit API - No auth token found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SubmitQuizBody = await request.json();
    console.log('Submit API - Request body:', JSON.stringify(body, null, 2));

    // Validate request body
    if (!body.answers || !Array.isArray(body.answers)) {
      console.error('Submit API - Invalid answers format');
      return NextResponse.json(
        { error: 'Invalid request body - answers array required' },
        { status: 400 }
      );
    }

    const backendUrl = `http://localhost:5004/api/quiztaker/quiz/${quizId}/submit`;
    console.log('Submit API - Calling backend:', backendUrl);

    // Make request to your backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        answers: body.answers,
      }),
    });

    console.log('Submit API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submit API - Backend error:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorData.message || 'Failed to submit quiz' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: errorText || 'Failed to submit quiz' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('Submit API - Backend success response:', JSON.stringify(data, null, 2));
    
    // Return submission ID for redirect
    return NextResponse.json({
      success: true,
      submissionId: data.submission.id,
      submission: data.submission,
    });

  } catch (error) {
    console.error('Submit API - Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}