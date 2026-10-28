import { NextResponse } from 'next/server';

function maintenanceResponse() {
  return NextResponse.json(
    { success: false, message: 'JAMB Practice is under maintenance. Please check back later.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

export const GET = maintenanceResponse;
export const POST = maintenanceResponse;
export const PATCH = maintenanceResponse;
