import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ email: string }> },
) {
  const { email } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        user_roles: { select: { role: { select: { id: true, name: true } } } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.user_roles.map((ur) => ur.role.name),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
