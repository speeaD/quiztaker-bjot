export async function POST(request: Request) {
  try {
    const {
      email,
      firstname,
      lastname,
      selectedQuestionSets,
      accountType
    }: {
      email: string;
      firstname: string;
      lastname: string;
      selectedQuestionSets: string[];
      accountType: string;
    } = await request.json();
    // Validate inputs
    if (
      !email ||
      !firstname ||
      !lastname ||
      !selectedQuestionSets ||
      selectedQuestionSets.length !== 4
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid input. Please provide all required fields and select exactly 4 question sets.",
        }),
        { status: 400 },
      );
    }

    const BACKEND_URL = process.env.BACKEND_URL;
    const response = await fetch(`${BACKEND_URL}/auth/quiztaker/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountType: accountType,
        email: email,
        firstname: firstname,
        lastname: lastname,
        questionSetCombination: selectedQuestionSets,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: errorData.message || "Registration failed" }),
        { status: response.status },
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during registration" }),
      { status: 500 },
    );
  }
}
