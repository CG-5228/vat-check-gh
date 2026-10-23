import type { MetadataRoute } from 'next';
import { merchants } from '@/lib/merchants';
import { SITE_URL } from '@/lib/seo';
import { verifiedAt } from '@/lib/source';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '',
    'apply/',
    'calculator/',
    'double-charge/',
    'faq/',
    'about/',
    'check/canva/',
    ...merchants.map((m) => `check/${m.slug}/`),
  ].map((path) => ({
    url: `${SITE_URL}/${path}`,
    lastModified: verifiedAt,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
