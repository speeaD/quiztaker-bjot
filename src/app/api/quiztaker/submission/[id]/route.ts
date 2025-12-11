import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params;
    
    console.log('Fetching submission results for:', submissionId);
    
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      console.error('Submission API - No auth token found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const backendUrl = `${process.env.BACKEND_URL}/quiztaker/submission/${submissionId}`;
    console.log('Submission API - Calling backend:', backendUrl);

    // Make request to your backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    console.log('Submission API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submission API - Backend error:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorData.message || 'Failed to fetch results' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: errorText || 'Failed to fetch results' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('Submission API - Success');
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Submission API - Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}