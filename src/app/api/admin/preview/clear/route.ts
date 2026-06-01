import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/maintenance", request.url));
  response.cookies.set("now-preview", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
