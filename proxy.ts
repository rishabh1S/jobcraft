import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAuthApi = pathname.startsWith("/api/auth");
  const isAuthPage = pathname === "/auth";

  if (isAuthApi) return NextResponse.next();

  if (!session?.user && !isAuthPage) {
    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (session?.user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
