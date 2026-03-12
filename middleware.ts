import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const authRoutes = new Set(["/login"]);

function createNextResponse(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });

  return to;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = createNextResponse(request);

  if (!supabaseUrl || !supabaseKey) {
    if (authRoutes.has(pathname)) {
      return response;
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        response = createNextResponse(request);

        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !authRoutes.has(pathname)) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    return copyCookies(response, redirectResponse);
  }

  if (user && authRoutes.has(pathname)) {
    const redirectResponse = NextResponse.redirect(new URL("/customers", request.url));
    return copyCookies(response, redirectResponse);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};