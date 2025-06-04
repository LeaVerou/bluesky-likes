let url = import.meta.url;

export default {
	root () {
		let defaultIcon = url
			? `<img src="${new URL("../logo.svg", url)}" alt="🦋" part="icon" />`
			: "🦋";
		return `
		<a id="link" target="_blank" part="link">
			<slot name="prefix">${defaultIcon}</slot>
			<span id="like_count" part="like-count">0</span>
			<slot name="suffix">
				likes on Bluesky
			</slot>
		</a>
		<slot></slot>
		<ul id="likers" part="likers"></ul>`;
	},
	user (actor) {
		let title = actor.displayName
			? `${actor.displayName} (@${actor.handle})`
			: `@${actor.handle}`;
		return `
		<li>
			<a href="https://bsky.app/profile/${actor.handle}" target="_blank" part="profile-link">
				${this.avatar({ actor, title })}
			</a>
		</li>`;
	},
	avatar ({ actor, title }) {
		if (!actor.avatar) {
			return this.avatarPlaceholder({ actor, title });
		}

		let avatarSrc = actor.avatar?.replace("avatar", "avatar_thumbnail");
		return `<img src="${avatarSrc}" title="${title}" alt="" part="avatar user" loading="lazy" />`;
	},
	avatarPlaceholder ({ title }) {
		return `
		<svg title="${title}" part="avatar placeholder" viewBox="0 0 24 24" fill="none" stroke="none">
			<circle cx="12" cy="12" r="12" fill="#0070ff"></circle><circle cx="12" cy="9.5" r="3.5" fill="#fff"></circle>
			<path stroke-linecap="round" stroke-linejoin="round" fill="#fff" d="M 12.058 22.784 C 9.422 22.784 7.007 21.836 5.137 20.262 C 5.667 17.988 8.534 16.25 11.99 16.25 C 15.494 16.25 18.391 18.036 18.864 20.357 C 17.01 21.874 14.64 22.784 12.058 22.784 Z"></path>
		</svg>`;
	},
	more ({ moreLikers, url }) {
		let moreLikersFormatted = moreLikers.toLocaleString("en", {
			notation: "compact",
		});
		let likedBy = url + "/liked-by";
		return `<li><a href="${likedBy}" target="_blank" part="avatar more">+${moreLikersFormatted}</a></li>`;
	},
	empty ({ url }) {
		return `No likes yet :( <a href="${url}" target="_blank">Be the first?</a>`;
	},
};
