import { type NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/utils/auth/password";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);
    return NextResponse.json({ hashedPassword });
  } catch (error: unknown) {
    console.error("Error hashing password:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
