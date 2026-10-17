import { NextRequest, NextResponse } from "next/server";

// Notice we removed the direct Prisma import!
// We only call our secure backend now.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const { model } = await params;
  
  try {
    // Get the user's token from the request header
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    // Ask the Express backend for the data securely
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/studio/${model}?limit=50`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}