import type { CollectionEntry } from 'astro:content';

export function sortPostsByDate(posts: CollectionEntry<'blog'>[]) {
	return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getFeaturedPost(posts: CollectionEntry<'blog'>[]) {
	return posts.find((post) => post.data.featured) ?? posts[0];
}

export function getLatestPosts(posts: CollectionEntry<'blog'>[], limit = 6) {
	return sortPostsByDate(posts).slice(0, limit);
}
