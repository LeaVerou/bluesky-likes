export const templates = {
	root ({ likers, likes, hiddenCount, url, element } = {}) {
		if (likes === 0) {
			return this.empty({ url });
		}

		return `<slot name="description" class="visually-hidden-always"><slot>${this.description({ likes, hiddenCount })}</slot></slot>
		${this.skipLink({ likers, likes, hiddenCount, url, element })}
		${likers?.map(liker => this.user(liker)).join(" ")}
		${hiddenCount > 0 ? this.more({ hiddenCount, url, element }) : ""}`;
	},
	skipLink ({ likes }) {
		if (likes <= 2) {
			return "";
		}

		return `
		<a part="skip-link" class="visually-hidden" href="#" onclick="[...this.getRootNode().host.shadowRoot.querySelectorAll('a')].at(-1)?.focus(); return false;">
			<slot name="skip">Skip to end</slot>
		</a>`;
	},
	description ({ likes, hiddenCount }) {
		return `${likes} users liked this post${hiddenCount > 0 ? `, ${likers.length} shown` : ""}.`;
	},
	user ({ actor }) {
		let title = actor.displayName
			? `${actor.displayName} (@${actor.handle})`
			: `@${actor.handle}`;
		let avatarSrc = actor.avatar?.replace("avatar", "avatar_thumbnail");
		return `
			<a href="https://bsky.app/profile/${actor.handle}" target="_blank" rel="nofollow" part="profile-link link${avatarSrc ? "" : " avatar"}" title="${title}">
				${avatarSrc ? `<img src="${avatarSrc}" alt="" part="avatar avatar-img" loading="lazy" />` : ""}
			</a>`;
	},
	more ({ hiddenCount, url, element }) {
		let hiddenCountFormatted = hiddenCount.toLocaleString(element._currentLang || "en", {
			notation: "compact",
		});
		let likedBy = url + "/liked-by";
		return `<a id="more-link" href="${likedBy}" target="_blank" part="avatar link more" style="--content-length: ${hiddenCountFormatted.length + 1}">+${hiddenCountFormatted}</a>`;
	},
	empty ({ url }) {
		return `No likes yet :( <a href="${url}" target="_blank">Be the first?</a>`;
	},
};

export const styles = `
:host {
	--avatar-size: calc(2em + 1vw);
	/* This is registered as a <length>, so we can use smaller font sizes in more while keeping the same avatar size */
	--bluesky-likers-avatar-size: var(--avatar-size);
	--avatar-overlap-percentage: 0.3;
	--avatar-overlap-percentage-y: 0.2;
	--avatar-border: .15em solid canvas;
	--avatar-shadow: 0 .1em .4em -.3em rgb(0 0 0 / 0.4);
	--avatar-background: ${svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="none">
			<circle cx="12" cy="12" r="12" fill="#0070ff"></circle><circle cx="12" cy="9.5" r="3.5" fill="#fff"></circle>
			<path stroke-linecap="round" stroke-linejoin="round" fill="#fff" d="M 12.058 22.784 C 9.422 22.784 7.007 21.836 5.137 20.262 C 5.667 17.988 8.534 16.25 11.99 16.25 C 15.494 16.25 18.391 18.036 18.864 20.357 C 17.01 21.874 14.64 22.784 12.058 22.784 Z"></path>
		</svg>`)} center / cover canvas;
	--more-background: #1185fe;
	--more-color-text: white;

	--avatar-overlap: calc(var(--bluesky-likers-avatar-size) * var(--avatar-overlap-percentage));
	--avatar-overlap-y: calc(var(--bluesky-likers-avatar-size) * var(--avatar-overlap-percentage-y));

	display: block;
	padding-inline-start: var(--avatar-overlap);
	padding-block-start: var(--avatar-overlap-y);
	/* Avoid more being on a new line by itself */
	text-wrap: pretty;
}

@keyframes loading {
	from { opacity: 0.5; }
	to { opacity: 0.8; }
}

:host(:state(loading)) a {
	animation: loading 1s infinite alternate;
}

a {
	text-decoration: none;
	color: inherit;
}

[part~="link"] {
	display: inline-flex;
	margin-inline-start: calc(-1 * var(--avatar-overlap));
	margin-block-start: calc(-1 * var(--avatar-overlap-y));

	vertical-align: middle;
	position: relative;

	&:hover,
	&:focus {
		z-index: 1;
	}
}

img {
	display: block;
}

[part~="avatar"] {
	block-size: var(--bluesky-likers-avatar-size);
	aspect-ratio: 1;
	object-fit: cover;
	border-radius: 50%;
	box-shadow: var(--avatar-shadow);
	border: var(--avatar-border);
	background: var(--avatar-background);
	transition: scale 0.1s ease-in-out;

	&:hover,
	&:focus {
		scale: 1.1;
	}
}

[part~="more"] {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: var(--more-background);
	color: var(--more-color-text);
	font-weight: 600;
	letter-spacing: -.03em;
	text-indent: -.2em; /* visual centering to account for + */
	font-size: calc(var(--bluesky-likers-avatar-size) / 3 - clamp(0, var(--content-length) - 3, 10) * .05em);
}

.visually-hidden,
.visually-hidden-always {
	position: absolute;
}

.visually-hidden:not(:focus-within),
.visually-hidden-always {
	display: block;
	width: 1px;
	height: 1px;
	clip: rect(0 0 0 0);
	clip-path: inset(50%);
	border: none;
	overflow: hidden;
	white-space: nowrap;
	padding: 0;
}

[part~="skip-link"]:focus {
	padding: 0.25em .5em;
	background: canvas;
	color: canvastext;
	z-index: 1;
}
`;

function svg (markup) {
	return `url('data:image/svg+xml,${encodeURIComponent(markup)}')`;
}
