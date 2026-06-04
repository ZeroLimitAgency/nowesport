import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const cookieName = "now-preview";

function safeNext(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

async function canPreview(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const secret = process.env.PREVIEW_SECRET;

  if (secret && token && token === secret) {
    return true;
  }

  if (!hasSupabaseEnv()) {
    return false;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL(safeNext(request), request.url));

  if (!(await canPreview(request))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  response.cookies.set(cookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
