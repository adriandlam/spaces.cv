import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Redirect CDN subdomain to R2 directly
  if (request.nextUrl.hostname === process.env.R2_CUSTOM_DOMAIN) {
    const r2Url = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${request.nextUrl.pathname}`;
    return NextResponse.redirect(r2Url);
  }

  const sessionCookie = getSessionCookie(request);

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie && request.nextUrl.pathname !== "/sign-in") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
