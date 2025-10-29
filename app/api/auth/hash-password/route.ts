import { type NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/utils/auth/password";
import {
  verifyRoleEnvVariable,
  withRoleProtection,
} from "@/utils/auth/routeProtection";

const adminRole = verifyRoleEnvVariable(process.env.ADMIN_ROLE_NAME);

export const POST = withRoleProtection(
  async (req: NextRequest) => {
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
  },
  [adminRole],
);
