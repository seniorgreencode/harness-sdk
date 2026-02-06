import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { z } from 'astro/zod'
import { docsSchema } from '@astrojs/starlight/schema'

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      // We have certain flags/behavior based on the following properties; see CMS-README.md for more info
      extend: z.object({
        // Can be a single value or an array of supported values
        languages: z.union([z.string(), z.array(z.string())]).optional(),
        community: z.boolean().default(false),
        experimental: z.boolean().default(false),
      }),
    }),
  }),
}
