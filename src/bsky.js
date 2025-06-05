const BASE_ENDPOINT = "https://public.api.bsky.app/xrpc/app.bsky.";

let endpoints = {
	profile: "actor.getProfile",
	posts: "feed.getPosts",
	likes: "feed.getLikes",
};

export const cacheByEndpoint = Object.fromEntries(
	Object.values(endpoints).map(endpoint => [endpoint, {}]),
);
/**
 * Parse a post like "https://bsky.app/profile/lea.verou.me/post/3lhygzakuic2n"
 * and return the handle and post ID
 * @param {string} url
 * @returns {object} {handle, postId}
 */
export function parsePostUrl (url) {
	return {
		handle: url.match(/\/profile\/([^\/]+)/)?.[1],
		postId: url.match(/\/post\/([^\/]+)/)?.[1],
	};
}

export async function getProfile (handle) {
	let endpoint = endpoints.profile;
	let cache = cacheByEndpoint[endpoint];

	if (cache[handle]) {
		return cache[handle];
	}

	let profileUrl = `${BASE_ENDPOINT}${endpoint}?actor=${handle}`;
	let data = getJSON(profileUrl);
	cache[handle] = data;
	data = await data;

	return (cache[handle] = data);
}

export async function getDid (handle) {
	if (handle.startsWith("did:")) {
		return handle;
	}

	return (await getProfile(handle))?.did;
}

// Bluesky “at-uri” of the post
export async function getPostUri (postUrl) {
	let post = parsePostUrl(postUrl);

	if (!post.handle || !post.postId) {
		return undefined;
	}

	let did = post.did ?? (await getDid(post.handle));

	if (!did) {
		return undefined;
	}

	return `at://${did}/app.bsky.feed.post/${post.postId}`;
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
	let data = getJSON(apiCall).then(data => data?.posts?.[0]);
	cache[postUrl] = data;
	data = await data;

	if (!data) {
		return null;
	}

	return (cache[postUrl] = data);
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

	let data = getJSON(apiCall).then(data => data?.likes);
	cache[postUrl] = data;

	data = await data;

	if (!data) {
		return null;
	}

	return (cache[postUrl] = data);
}

function getJSON (url) {
	return fetch(url).then(res => res.json());
}
