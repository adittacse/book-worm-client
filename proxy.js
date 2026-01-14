import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login", "/register"];

export async function proxy(req) {
    const { pathname, search } = req.nextUrl;

    // allow next internal + static + auth endpoints
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/api/auth")
    ) {
        return NextResponse.next();
    }

    // allow public auth pages
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        return NextResponse.next();
    }

    // NOTE: secret must exist in production
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // not logged in => redirect to login (KEEP full callback with query)
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", pathname + search);
        return NextResponse.redirect(url);
    }

    // home route behavior
    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname =
            token.role === "admin" ? "/dashboard/admin" : "/dashboard/user/my-library";
        return NextResponse.redirect(url);
    }

    // admin-only area protection
    if (pathname.startsWith("/dashboard/admin") && token.role !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard/user/my-library";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!.*\\..*).*)"],
};
