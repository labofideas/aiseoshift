#!/usr/bin/env node
// One-time helper to obtain a Tumblr OAuth 1.0a user token + secret for the
// aiseoshift account. Run locally: node scripts/tumblr-oauth-setup.mjs
//
// Prereq: register an app at https://www.tumblr.com/oauth/apps
//   - Default callback URL: http://localhost:8765/callback
//   - Note the OAuth Consumer Key + Secret
//
// Then run this script and follow the prompts.

import { createHmac, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const REQUEST_TOKEN_URL = 'https://www.tumblr.com/oauth/request_token';
const AUTHORIZE_URL = 'https://www.tumblr.com/oauth/authorize';
const ACCESS_TOKEN_URL = 'https://www.tumblr.com/oauth/access_token';
const CALLBACK_PORT = 8765;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

const rl = createInterface({ input: stdin, output: stdout });

const consumerKey = (await rl.question('Tumblr Consumer Key: ')).trim();
const consumerSecret = (await rl.question('Tumblr Consumer Secret: ')).trim();
if (!consumerKey || !consumerSecret) {
	console.error('Both values required.');
	process.exit(1);
}

console.log('\nStep 1: requesting a temporary token...');
const requestTokenRes = await oauth1Post(
	REQUEST_TOKEN_URL,
	{ oauth_callback: CALLBACK_URL },
	{ consumerKey, consumerSecret, token: '', tokenSecret: '' },
);
const requestTokenParams = parseQuery(requestTokenRes);
const requestToken = requestTokenParams.oauth_token;
const requestTokenSecret = requestTokenParams.oauth_token_secret;
if (!requestToken) {
	console.error('Failed to get request token. Response:', requestTokenRes);
	process.exit(1);
}

console.log('\nStep 2: open this URL in your browser, authorize the app:');
console.log(`  ${AUTHORIZE_URL}?oauth_token=${encodeURIComponent(requestToken)}`);
console.log('\n(After authorizing, Tumblr will redirect back to localhost. This script is listening.)\n');

const verifier = await waitForCallback();

console.log('\nStep 3: exchanging for access token...');
const accessRes = await oauth1Post(
	ACCESS_TOKEN_URL,
	{ oauth_verifier: verifier },
	{ consumerKey, consumerSecret, token: requestToken, tokenSecret: requestTokenSecret },
);
const accessParams = parseQuery(accessRes);
const oauthToken = accessParams.oauth_token;
const oauthSecret = accessParams.oauth_token_secret;
if (!oauthToken) {
	console.error('Failed to get access token. Response:', accessRes);
	process.exit(1);
}

console.log('\n=========================================');
console.log('Add these to GitHub repo Secrets:');
console.log('=========================================');
console.log(`TUMBLR_CONSUMER_KEY    = ${consumerKey}`);
console.log(`TUMBLR_CONSUMER_SECRET = ${consumerSecret}`);
console.log(`TUMBLR_OAUTH_TOKEN     = ${oauthToken}`);
console.log(`TUMBLR_OAUTH_SECRET    = ${oauthSecret}`);
console.log(`TUMBLR_BLOG            = aiseoshift`);
console.log('=========================================\n');

rl.close();
process.exit(0);

// ---------- helpers ----------

function waitForCallback() {
	return new Promise((resolve, reject) => {
		const server = createServer((req, res) => {
			const u = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);
			if (u.pathname !== '/callback') {
				res.statusCode = 404;
				res.end();
				return;
			}
			const verifier = u.searchParams.get('oauth_verifier');
			res.setHeader('content-type', 'text/html');
			if (verifier) {
				res.end('<h1>Authorized.</h1><p>You can close this tab.</p>');
				server.close();
				resolve(verifier);
			} else {
				res.end('<h1>No oauth_verifier in callback.</h1>');
				server.close();
				reject(new Error('Tumblr did not return oauth_verifier'));
			}
		});
		server.listen(CALLBACK_PORT, () => {
			console.log(`Listening on ${CALLBACK_URL} ...`);
		});
	});
}

async function oauth1Post(url, params, creds) {
	const oauthParams = {
		oauth_consumer_key: creds.consumerKey,
		oauth_nonce: randomBytes(16).toString('hex'),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
		oauth_version: '1.0',
	};
	if (creds.token) oauthParams.oauth_token = creds.token;

	const allParams = { ...params, ...oauthParams };
	const paramString = Object.keys(allParams)
		.sort()
		.map((k) => `${rfc3986(k)}=${rfc3986(allParams[k])}`)
		.join('&');

	const baseString = ['POST', rfc3986(url), rfc3986(paramString)].join('&');
	const signingKey = `${rfc3986(creds.consumerSecret)}&${rfc3986(creds.tokenSecret || '')}`;
	oauthParams.oauth_signature = createHmac('sha1', signingKey).update(baseString).digest('base64');

	const authHeader =
		'OAuth ' +
		Object.keys(oauthParams)
			.sort()
			.map((k) => `${rfc3986(k)}="${rfc3986(oauthParams[k])}"`)
			.join(', ');

	const body = Object.keys(params)
		.map((k) => `${rfc3986(k)}=${rfc3986(params[k])}`)
		.join('&');

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			authorization: authHeader,
			'content-type': 'application/x-www-form-urlencoded',
		},
		body,
	});
	return res.text();
}

function parseQuery(s) {
	const out = {};
	for (const pair of s.split('&')) {
		const [k, v = ''] = pair.split('=');
		out[decodeURIComponent(k)] = decodeURIComponent(v);
	}
	return out;
}

function rfc3986(s) {
	return encodeURIComponent(String(s)).replace(
		/[!*'()]/g,
		(c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
	);
}
