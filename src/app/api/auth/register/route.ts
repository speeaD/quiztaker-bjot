import { normalizeRegistrationSubjects, validRegistrationCombination } from "@/lib/registration-subjects";

export async function POST(request: Request) {
  try {
    const {
      email,
      firstname,
      lastname,
      selectedQuestionSets,
      phone,
      parentName,
      parentPhone,
      department,
      course,
      firstJamb,
      lastJambScore,
      accountType,
    }: {
      email: string;
      firstname: string;
      lastname: string;
      phone: string;
      parentName: string;
      parentPhone: string;
      department: string;
      course: string;
      firstJamb: boolean;
      lastJambScore: number;
      selectedQuestionSets: string[];
      accountType: string;
    } = await request.json();
    // Validate inputs
    if (
      !email ||
      !firstname ||
      !lastname ||
      !Array.isArray(selectedQuestionSets) ||
      selectedQuestionSets.length !== 4 ||
      !selectedQuestionSets.every((id) => typeof id === "string" && id.trim()) ||
      new Set(selectedQuestionSets).size !== 4
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Please provide all required fields and select English plus exactly three other subjects.",
        }),
        { status: 400 },
      );
    }

    const BACKEND_URL = process.env.BACKEND_URL;
    const subjectsResponse = await fetch(`${BACKEND_URL}/questionset?isActive=true`, { cache: "no-store" });
    if (!subjectsResponse.ok) {
      return Response.json({ error: "Unable to validate your subjects. Please try again later." }, { status: 503 });
    }
    const subjectsData = await subjectsResponse.json();
    const subjects = normalizeRegistrationSubjects(subjectsData.questionSets);
    if (!validRegistrationCombination(selectedQuestionSets, subjects)) {
      return Response.json({ error: "Please select compulsory English plus exactly three other active subjects." }, { status: 400 });
    }
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
        phone: phone,
        parentName: parentName,
        parentPhone: parentPhone,
        department: department,
        course: course,
        firstJamb: firstJamb,
        lastJambScore: lastJambScore,
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
