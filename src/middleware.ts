import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { updateSession } from '@/utils/supabase/middleware';

import { AppConfig } from './utils/AppConfig';

// Middleware to handle locale and session update
export async function middleware(request: NextRequest) {
  // Update the session using Supabase
  const sessionResponse = await updateSession(request);

  // Locale handling from next-intl
  const localeMiddleware = createMiddleware({
    locales: AppConfig.locales,
    localePrefix: AppConfig.localePrefix,
    defaultLocale: AppConfig.defaultLocale,
  });

  // Apply locale middleware to get the initial response
  const response = await localeMiddleware(request);

  // Ensure cookies are reflected in the final response
  const cookiesToSet = sessionResponse.cookies.getAll();
  cookiesToSet.forEach(
    (cookie: { name: string; value: string; options?: any }) => {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    },
  );

  return response;
}

// Configuring the matcher to exclude certain paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'], // Also exclude tunnelRoute used in Sentry from the matcher
};
