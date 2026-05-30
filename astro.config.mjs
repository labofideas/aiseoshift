// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://aiseoshift.com',
  integrations: [mdx(), sitemap()],

  markdown: {
      rehypePlugins: [
          [
              rehypeExternalLinks,
              {
                  target: '_blank',
                  rel: ['noopener', 'noreferrer'],
              },
          ],
      ],
	},

  adapter: cloudflare(),
});