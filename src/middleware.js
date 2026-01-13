import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login", "/register"];

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // allow next internal + static files
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/api/auth")
    ) {
        return NextResponse.next();
    }

    // allow public auth pages
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // not logged in => redirect to login
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
    }

    // home route behavior (requirement)
    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = token.role === "admin" ? "/dashboard/admin" : "/my-library";
        return NextResponse.redirect(url);
    }

    // admin-only area protection
    if (pathname.startsWith("/dashboard/admin")) {
        if (token.role !== "admin") {
            const url = req.nextUrl.clone();
            url.pathname = "/my-library";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!.*\\..*).*)"], // everything except files with extensions
};
