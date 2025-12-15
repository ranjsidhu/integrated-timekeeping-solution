import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth(async (req: NextRequest) => {
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-current-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: reqHeaders,
    },
  });
});
