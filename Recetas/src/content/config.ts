import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    videoUrl: z.string().optional(), // Soporte para YouTube/TikTok
    location: z.object({
      lat: z.number(),
      lng: z.number(),
      label: z.string()
    }),
  }),
});

export const collections = { blog };
