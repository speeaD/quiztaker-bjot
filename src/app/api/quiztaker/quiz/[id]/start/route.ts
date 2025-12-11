import { NextRequest, NextResponse } from "next/server";

interface StartQuizBody {
  quizTaker: string;
}
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = await params.id;

    // Get the auth token from cookies
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: StartQuizBody = await request.json();

    if (!body.quizTaker) {
      return NextResponse.json(
        { error: 'Quiz taker ID is required' },
        { status: 400 }
      );
    }

    // Make request to your backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/quiztaker/quiz/${quizId}/start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          quizTaker: body.quizTaker,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to start quiz" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
