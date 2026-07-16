import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import { logger } from '@/lib/logger';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const routes = [
    {
      url: `${appUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${appUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${appUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    await connectToDatabase();
    const services = await Service.find({}).select('_id updatedAt');

    const serviceUrls = services.map((service) => ({
      url: `${appUrl}/services/${service._id}`,
      lastModified: new Date(service.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...routes, ...serviceUrls];
  } catch (error) {
    logger.error('Failed to generate dynamic sitemap urls, fallback to static routes', error);
    return routes;
  }
}
