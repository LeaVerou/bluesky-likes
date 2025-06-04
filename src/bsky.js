const HOST = "https://public.api.bsky.app";
const PROFILES_ENDPOINT = "/xrpc/app.bsky.actor.getProfile";
const POSTS_ENDPOINT = "/xrpc/app.bsky.feed.getPosts";
const LIKES_ENDPOINT = "/xrpc/app.bsky.feed.getLikes";

/**
 * Parse a post like "https://bsky.app/profile/lea.verou.me/post/3lhygzakuic2n"
 * and return the username and post ID
 * @param {string} url
 * @returns {object} {username, postId}
 */
export function parsePostUrl (url) {
	let ret = {};
	ret.username = url.match(/\/profile\/([^\/]+)/)?.[1];
	ret.postId = url.match(/\/post\/([^\/]+)/)?.[1];

	if (ret.username.startsWith("did:")) {
		ret.did = ret.username;
		ret.username = null;
	}

	return ret;
}

export async function getProfile (username) {
	let profileUrl = `${HOST}${PROFILES_ENDPOINT}?actor=${username}`;
	return (await fetch(profileUrl)).json();
}

export async function getPost (did, postId) {
	// Bluesky “at-uri” of the post
	const postUri = `at://${did}/app.bsky.feed.post/${postId}`;
	const postUrl = `${HOST}${POSTS_ENDPOINT}?uris=${postUri}`;
	return (await fetch(postUrl)).json();
}

export async function getPostLikes (did, postId, limit = 100) {
	// Bluesky “at-uri” of the post
	const postUri = `at://${did}/app.bsky.feed.post/${postId}`;
	const likesUrl = `${HOST}${LIKES_ENDPOINT}?limit=${limit}&uri=${postUri}`;
	return (await fetch(likesUrl)).json();
}
