import { NextResponse, type NextRequest } from "next/server";
import { normalizeLocale } from "@/lib/cms";

export function GET(request: NextRequest) {
  const locale = normalizeLocale(request.nextUrl.searchParams.get("lang"));
  const next = request.nextUrl.searchParams.get("next") || "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const response = NextResponse.redirect(new URL(safeNext, request.nextUrl.origin));

  response.cookies.set("now-locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}
