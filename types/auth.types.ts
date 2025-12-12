import type { NextRequest, NextResponse } from "next/server";
import type { Account, User } from "next-auth";

export type AuthResult =
  | {
      isAuthorized: false;
      response: NextResponse;
      user?: never;
    }
  | {
      isAuthorized: true;
      response: null;
      user: { id: number; roles: string[] };
    };

export type UserValidationResult =
  | {
      isAuthorized: false;
      response: NextResponse;
      userId?: never;
    }
  | {
      isAuthorized: true;
      response: null;
      userId: number;
    };

export type RouteHandler = (
  req: NextRequest,
  context?: unknown,
) => Promise<NextResponse>;

export interface Credentials {
  email: string;
  password: string;
}

export type SignInCallbackParams = {
  user: User;
  account: Account | null | undefined;
};
