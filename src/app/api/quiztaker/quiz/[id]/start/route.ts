import { NextRequest, NextResponse } from "next/server";

interface StartQuizBody {
  quizTaker: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    const authToken = request.cookies.get("auth-token")?.value;
    const body = await request.json();

    console.log("Auth token exists:", !!authToken);
    console.log("Quiz ID:", quizId);

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  

    if (!body) {
      return NextResponse.json(
        { error: 'Quiz taker ID is required' },
        { status: 400 }
      );
    }
    const backendUrl = `${process.env.BACKEND_URL}`;

    const response = await fetch(
      `${backendUrl}/quiztaker/quiz/${quizId}/start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    
    console.log("Backend response status:", response.status);
    const data = await response.json();
    console.log("Backend response data:", data);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Failed to start quiz" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}