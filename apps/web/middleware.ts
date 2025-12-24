import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth-client"

const protectedRoutes = ["/room", "/space"];


export async function middleware(request: NextRequest) {
 
 
// const session = await getSession()

//   const { pathname } = request.nextUrl;

//   console.log("Middleware - Pathname:", pathname);

//   if (pathname.startsWith('/api/auth')) {
//     return NextResponse.next();
//   }

// // redirect to room if user is authenticated and tries to access signin page
//   if (pathname === "/signin" && session) {
//     return NextResponse.redirect(new URL("/room", request.url));
//   }

// // Check if the current path starts with any protected route
//   const isProtectedRoute = protectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );

//   if (isProtectedRoute && !session) {
//     console.log(`Redirecting unauthenticated user from ${pathname} to /signin`);
//     return NextResponse.redirect(new URL("/signin", request.url));
//   }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
