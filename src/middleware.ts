// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs'; // <--- thêm dòng này

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("token")?.value;

    if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (err) {
      console.error("JWT verify failed:", err);
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
