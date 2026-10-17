import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const allowedModels = [
  "user",
  "account",
  "session",
  "verificationToken",
  "passwordResetToken",
  "site",
  "event",
  "sessionRecord",
  "widget",
  "report",
] as const;

type ModelName = (typeof allowedModels)[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const { model } = await params;
  const modelName = model.toLowerCase() as ModelName;

  if (!allowedModels.includes(modelName)) {
    return NextResponse.json({ error: "Model not allowed" }, { status: 400 });
  }

  try {
    // @ts-ignore
    const data = await prisma[modelName].findMany({
      take: 50, // limit for safety
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data });
  } catch (error) {
    // some models don't have createdAt
    try {
      // @ts-ignore
      const data = await prisma[modelName].findMany({
        take: 50,
      });
      return NextResponse.json({ data });
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }
  }
}