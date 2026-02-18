import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const backendUrl = `${process.env.BACKEND_URL}`

    const response = await fetch(
      `${backendUrl}/attendance/student/classes/today`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch attendance history' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.data);

  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}