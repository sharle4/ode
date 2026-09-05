import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ode.poesie.fr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin',
          '/api/',
          '/settings',
          '/onboarding',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
