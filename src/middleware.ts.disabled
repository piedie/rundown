import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isHealthRoute = nextUrl.pathname === "/api/health";
  const isLoginRoute = nextUrl.pathname === "/login";

  if (isAuthRoute || isHealthRoute) return;

  if (!isLoggedIn && !isLoginRoute) {
    const url = new URL("/login", nextUrl);
    return Response.redirect(url);
  }

  if (isLoggedIn && isLoginRoute) {
    const url = new URL("/", nextUrl);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
