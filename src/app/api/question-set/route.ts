import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET() {
    try {
    const response = await fetch(`${BACKEND_URL}/questionset?isActive=true`, {
      cache: 'no-store',
    });
    console.log('Fetching question sets from:', `${BACKEND_URL}/questionset?isActive=true`);
    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error('Failed to fetch question sets');
    }

    const data = await response.json();
    return NextResponse.json(data.questionSets);
  } catch (error) {
    console.error('Error fetching question sets:', error);
    return NextResponse.json({ error: 'Failed to fetch question sets' }, { status: 500 });
  }
}