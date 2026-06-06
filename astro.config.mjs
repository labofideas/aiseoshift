// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://aiseoshift.com',
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const url = item.url;
        const today = new Date().toISOString().split('T')[0];

        if (url.match(/aiseoshift\.com\/?$/)) {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (url.includes('/blog/category/')) {
          item.priority = 0.6;
          item.changefreq = 'daily';
        } else if (url.includes('/blog/')) {
          item.priority = 0.7;
          item.changefreq = 'weekly';
        } else if (url.includes('/seo/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (
          ['/chatgpt-seo', '/perplexity-seo', '/claude-seo', '/gemini-seo',
           '/bing-seo', '/copilot-seo', '/ai-overviews-seo', '/ai-mode-seo',
           '/aeo', '/geo', '/ai-seo-shift'].some((p) => url.includes(p))
        ) {
          item.priority = 0.9;
          item.changefreq = 'monthly';
        } else if (url.includes('/ai-seo-services')) {
          item.priority = 0.85;
          item.changefreq = 'monthly';
        } else if (url.includes('/tools/')) {
          item.priority = 0.75;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }

        item.lastmod = today;
        return item;
      },
    }),
  ],

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