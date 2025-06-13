const BASE_ENDPOINT = "https://public.api.bsky.app/xrpc/app.bsky.";

let endpoints = {
	profile: "actor.getProfile",
	posts: "feed.getPosts",
	likes: "feed.getLikes",
};

/**
 * Cached API responses by endpoint
 * @type {Record<string, Record<string, BlueskyProfile | BlueskyPost | BlueskyLike[] | Promise<BlueskyProfile | BlueskyPost | BlueskyLike[] | null | undefined> | null | undefined>>}
 */
export const cacheByEndpoint = Object.fromEntries(
	Object.values(endpoints).map(endpoint => [endpoint, {}]),
);

/**
 * Parse a post like "https://bsky.app/profile/lea.verou.me/post/3lhygzakuic2n"
 * and return the handle and post ID
 * @param {string} url
 * @returns {{ handle: string | undefined, postId: string | undefined }}
 */
export function parsePostUrl (url) {
	return {
		handle: url.match(/\/profile\/([^\/]+)/)?.[1],
		postId: url.match(/\/post\/([^\/]+)/)?.[1],
	};
}

/**
 * Get profile details by handle
 * @param {string} handle
 * @param {Object} [options]
 * @param {boolean} [options.force] - Bypass the cache and fetch the data again even if cached.
 * @returns {Promise<BlueskyProfile | null | undefined>}
 */
export async function getProfile (handle, options = {}) {
	let endpoint = endpoints.profile;
	let cache = cacheByEndpoint[endpoint];

	if (cache[handle] && !options.force) {
		return cache[handle];
	}

	let profileUrl = `${BASE_ENDPOINT}${endpoint}?actor=${handle}`;
	let data = getJSON(profileUrl);
	cache[handle] = data;
	data = await data;

	return (cache[handle] = data);
}

/**
 * Get the DID of a user by their handle.
 * Does not send an API call if the handle is already a DID.
 * @param {string} handle
 * @returns {Promise<string | undefined>}
 */
export async function getDid (handle) {
	if (handle.startsWith("did:")) {
		return handle;
	}

	return (await getProfile(handle))?.did;
}

/**
 * Bluesky "at-uri" of the post
 * @param {string} postUrl
 * @returns {Promise<string | undefined>}
 */
export async function getPostUri (postUrl) {
	let post = parsePostUrl(postUrl);

	if (!post.handle || !post.postId) {
		return undefined;
	}

	let did = await getDid(post.handle);

	if (!did) {
		return undefined;
	}

	return `at://${did}/app.bsky.feed.post/${post.postId}`;
}

/**
 * Get post details by URL.
 * @param {string} postUrl
 * @param {Object} [options]
 * @param {boolean} [options.force] - Bypass the cache and fetch the data again even if cached.
 * @returns {Promise<BlueskyPost | null | undefined>}
 */
export async function getPost (postUrl, options = {}) {
	let endpoint = endpoints.posts;
	let cache = cacheByEndpoint[endpoint];

	if (cache[postUrl] && !options.force) {
		return cache[postUrl];
	}

	const postUri = await getPostUri(postUrl);

	if (!postUri) {
		return undefined;
	}

	const apiCall = `${BASE_ENDPOINT}${endpoint}?uris=${postUri}`;
	let data = getJSON(apiCall).then(data => data?.posts?.[0]);
	cache[postUrl] = data;
	data = await data;

	if (!data) {
		return null;
	}

	return (cache[postUrl] = data);
}

/**
 * Get the likers for a post by its URL.
 * @param {string} postUrl
 * @param {Object} [options]
 * @param {boolean} [options.force] - Bypass the cache and fetch the data again even if cached.
 * @param {number} [options.limit] - Limit the number of returned likes
 * @returns {Promise<BlueskyLike[] | null | undefined>}
 */
export async function getPostLikes (postUrl, options = {}) {
	let endpoint = endpoints.likes;
	let cache = cacheByEndpoint[endpoint];

	if (cache[postUrl] && !options.force) {
		return cache[postUrl];
	}

	const postUri = await getPostUri(postUrl);

	if (!postUri) {
		return undefined;
	}

	let apiCall = `${BASE_ENDPOINT}${endpoint}?uri=${postUri}`;

	if (options.limit) {
		let limit = Math.min(options.limit, 100);
		apiCall += `&limit=${limit}`;
	}

	let data = getJSON(apiCall).then(data => data?.likes);
	cache[postUrl] = data;

	data = await data;

	if (!data) {
		return null;
	}

	return (cache[postUrl] = data);
}

/**
 * @param {string} url
 * @returns {Promise<any>}
 */
function getJSON (url) {
	return fetch(url).then(res => res.json());
}

// Extracted from the @atproto/api package

/**
 * @typedef {Object} BlueskyActor
 * @property {string} did - The DID (Decentralized Identifier) of the actor
 * @property {string} handle - The handle (username) of the actor
 * @property {string} [displayName] - Optional display name of the actor
 * @property {string} [avatar] - Optional URL to the actor's avatar
 */

/**
 * @typedef {Object} BlueskyPostRecord
 * @property {string} text - The text content of the post
 * @property {string} createdAt - The creation timestamp of the post
 * @property {string[]} [langs] - Optional languages used
 * @property {any[]} [facets] - Optional facets
 * @property {any} [embed] - Optional embed object
 * @property {{ root: { cid: string, uri: string }, parent: { cid: string, uri: string } }} [reply] - Optional reply info
 * @property {any[]} [labels] - Optional labels
 */

/**
 * @typedef {Object} BlueskyPost
 * @property {string} uri - The URI of the post
 * @property {string} cid - The CID of the post
 * @property {BlueskyActor} author - The author of the post
 * @property {BlueskyPostRecord} record - The post record
 * @property {number} likeCount - Number of likes
 * @property {number} repostCount - Number of reposts
 * @property {number} replyCount - Number of replies
 * @property {string} indexedAt - Index timestamp
 * @property {{ like?: string, repost?: string }} [viewer] - Viewer state
 */

/**
 * @typedef {Object} BlueskyLike
 * @property {string} uri - The URI of the like
 * @property {string} cid - The CID of the like
 * @property {string} createdAt - Like timestamp
 * @property {string} indexedAt - Index timestamp
 * @property {BlueskyActor} actor - The actor who liked the post
 */

/**
 * @typedef {Object} BlueskyProfile
 * @property {string} did - The DID of the profile
 * @property {string} handle - The handle of the profile
 * @property {string} [displayName] - Optional display name
 * @property {string} [description] - Optional profile description
 * @property {string} [avatar] - Optional avatar URL
 * @property {string} [banner] - Optional banner URL
 * @property {number} followersCount - Number of followers
 * @property {number} followsCount - Number of accounts followed
 * @property {number} postsCount - Number of posts
 * @property {string} indexedAt - When the profile was indexed
 * @property {{ muted: boolean, blockedBy: boolean }} [viewer] - Viewer state
 */
