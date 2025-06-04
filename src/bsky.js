const HOST = "https://public.api.bsky.app";
const BASE_ENDPOINT = HOST + "/xrpc/app.bsky.";

let endpoints = {
	profile: "actor.getProfile",
	posts: "feed.getPosts",
	likes: "feed.getLikes",
};

let cacheByEndpoint = Object.fromEntries(Object.values(endpoints).map(endpoint => [endpoint, {}]));
/**
 * Parse a post like "https://bsky.app/profile/lea.verou.me/post/3lhygzakuic2n"
 * and return the handle and post ID
 * @param {string} url
 * @returns {object} {handle, postId}
 */
export function parsePostUrl (url) {
	let ret = {};
	ret.handle = url.match(/\/profile\/([^\/]+)/)?.[1];
	ret.postId = url.match(/\/post\/([^\/]+)/)?.[1];

	if (ret.handle.startsWith("did:")) {
		ret.did = ret.handle;
		ret.handle = null;
	}

	return ret;
}

export async function getProfile (handle) {
	let endpoint = endpoints.profile;
	let cache = cacheByEndpoint[endpoint];

	if (cache[handle]) {
		return cache[handle];
	}

	let profileUrl = `${BASE_ENDPOINT}${endpoint}?actor=${handle}`;
	let profile = await (await fetch(profileUrl)).json();
	return (cache[handle] = profile);
}

export async function getDid (handle) {
	return (await getProfile(handle))?.did;
}

let postUriCache = {};

// Bluesky “at-uri” of the post
export async function getPostUri (postUrl) {
	if (postUriCache[postUrl]) {
		return postUriCache[postUrl];
	}

	let post = parsePostUrl(postUrl);

	if (!post.handle || !post.postId) {
		return undefined;
	}

	let did = post.did ?? (await getDid(post.handle));

	if (!did) {
		return undefined;
	}

	let postUri = `at://${did}/app.bsky.feed.post/${post.postId}`;
	postUriCache[postUrl] = postUri;
	return postUri;
}

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
	let data = await (await fetch(apiCall)).json();
	let post = data?.posts?.[0];

	if (!post) {
		return null;
	}

	return (cache[postUrl] = post);
}

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
		apiCall += `&limit=${options.limit}`;
	}

	let data = await (await fetch(apiCall)).json();
	let likes = data?.likes;

	if (!likes) {
		return null;
	}

	return (cache[postUrl] = likes);
}
