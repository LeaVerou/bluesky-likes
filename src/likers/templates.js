export default {
	root () {
		return "";
	},
	user ({ actor }) {
		let title = actor.displayName
			? `${actor.displayName} (@${actor.handle})`
			: `@${actor.handle}`;
		let avatarSrc = actor.avatar?.replace("avatar", "avatar_thumbnail");
		return `
			<a href="https://bsky.app/profile/${actor.handle}" target="_blank" rel="nofollow" part="user link${avatarSrc ? "" : " avatar"}" title="${title}">
				${avatarSrc ? `<img src="${avatarSrc}" alt="" part="avatar avatar-img" loading="lazy" />` : ""}
			</a>`;
	},
	more ({ hiddenCount, url }) {
		let hiddenCountFormatted = hiddenCount.toLocaleString("en", {
			notation: "compact",
		});
		let likedBy = url + "/liked-by";
		return `<a href="${likedBy}" target="_blank" part="avatar more">+${hiddenCountFormatted}</a>`;
	},
	empty ({ url }) {
		return `No likes yet :( <a href="${url}" target="_blank">Be the first?</a>`;
	},
};
