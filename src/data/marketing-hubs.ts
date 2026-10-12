// Marketing hub pages at /marketing/<slug>/. A post joins a hub by carrying the hub's `tag` in its frontmatter tags.
export interface MarketingHub {
	slug: string;
	tag: string;
	title: string;
	description: string;
	intro: string[];
}

export const marketingHubs: MarketingHub[] = [
	{
		slug: 'paid-social',
		tag: 'Paid social',
		title: 'Paid Social Advertising',
		description: 'Guides to running Meta, TikTok, YouTube and Google ads in 2026: campaign setup, targeting after the AI delivery changes, tracking and budgets.',
		intro: [
			'Paid social changed more in 2025 and 2026 than in the five years before. Meta and TikTok now pick who sees an ad largely by reading the ad itself, so audience settings matter less and creative and conversion data matter more.',
			'These guides cover how each platform works now, how to set up tracking that the delivery systems can learn from, and how to structure campaigns and budgets so automation works for you instead of against you.',
		],
	},
	{
		slug: 'ad-creative',
		tag: 'Ad creative',
		title: 'Ad Creative',
		description: 'How to make, write and test ad creative that performs: hooks, copy, UGC, creative testing and creative fatigue on Meta, TikTok and YouTube.',
		intro: [
			'Creative is now the biggest lever in performance marketing. Ad platforms use what your ad shows and says to find the people most likely to respond, and they reward a steady supply of genuinely different concepts.',
			'Start with how to build a high-performing ad, then go deeper on hooks, copy, UGC and testing. Every guide is written for teams that have to ship new ads every week.',
		],
	},
	{
		slug: 'creator-marketing',
		tag: 'Creator marketing',
		title: 'Creator and Influencer Marketing',
		description: 'Working with UGC creators, micro influencers and creator partners: how to find them, brief them, pay them and turn their content into ads.',
		intro: [
			'Creators are now part of the core marketing stack, not a side project. UGC creators make ad content that looks native to the feed, and micro influencers bring trust that brand accounts rarely earn on their own.',
			'These guides cover both sides: how creators get hired, and how brands find, vet, brief and pay creators, then reuse their content in paid campaigns.',
		],
	},
	{
		slug: 'measurement',
		tag: 'Marketing measurement',
		title: 'Marketing Measurement and Attribution',
		description: 'How to measure marketing that works: ROAS, KPIs, attribution, incrementality testing, marketing mix modeling and customer acquisition cost.',
		intro: [
			'Every ad platform reports its own version of success, and they all count the same sales. Good measurement means knowing which numbers to trust, which to ignore, and how to test what your marketing actually adds.',
			'Start with the KPIs and ROAS basics, then move to attribution, incrementality tests and marketing mix modeling as your budget grows.',
		],
	},
	{
		slug: 'email-marketing',
		tag: 'Email marketing',
		title: 'Email Marketing and Retention',
		description: 'Email and retention marketing guides: platforms, automations, deliverability, cold email, segmentation, referral and loyalty programs.',
		intro: [
			'Email is still the channel you own outright, and retention is where most of the profit in a customer relationship sits. A few well-built automations usually outperform a busy campaign calendar.',
			'These guides cover choosing a platform, building a list properly, the automations to set up first, deliverability, and the referral and loyalty programs that turn buyers into repeat buyers.',
		],
	},
	{
		slug: 'strategy',
		tag: 'Marketing strategy',
		title: 'Marketing Strategy and Planning',
		description: 'Marketing plans, launch plans, seasonal campaigns, conversion rate optimization and full-funnel systems for growing brands.',
		intro: [
			'Tactics only work inside a plan. These guides help you decide what to do, in what order, and how to connect channels into one system, from a one-page marketing plan to product launches and seasonal campaigns.',
			'You will also find conversion guides for the pages where marketing turns into revenue: landing pages and checkout.',
		],
	},
];
