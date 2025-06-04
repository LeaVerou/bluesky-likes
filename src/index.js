import { parsePostUrl, getProfile, getPost, getPostLikes } from "./bsky.js";
import styles from "./styles.js";
import templates from "./templates.js";

let sheet;

export default class BlueskyLikes extends HTMLElement {
	static dids = {};
	static templates = templates;
	#data = {};
	#dom = {};

	constructor () {
		super();
		this.attachShadow({ mode: "open" });

		this._internals = this.attachInternals?.();

		if (this.shadowRoot.adoptedStyleSheets) {
			if (!sheet) {
				sheet = new CSSStyleSheet();
				sheet.replaceSync(styles);
			}

			this.shadowRoot.adoptedStyleSheets = [sheet];
			this.shadowRoot.innerHTML = templates.root();
		}
		else {
			this.shadowRoot.innerHTML = `
				<style>${styles}</style>
				${BlueskyLikes.templates.root()}
			`;
		}

		this.#dom.link = this.shadowRoot.querySelector("#link");
		this.#dom.likeCount = this.shadowRoot.querySelector("#like_count");
		this.#dom.likers = this.shadowRoot.querySelector("#likers");
	}

	connectedCallback () {
		this.render();
	}

	get post () {
		return this.#data.post;
	}

	get likes () {
		return this.#data.likes;
	}

	get likers () {
		return this.#data.likers;
	}

	async render () {
		let postUrl = this.src;
		this.#dom.link.href = postUrl;

		let post = await getPost(postUrl);

		if (!post) {
			// Lazy loading?
			return;
		}

		this.#data.post = post;
		let likes = (this.#data.likes = post.likeCount);
		let hasLikes = likes > 0;

		// Output likes to the DOM as soon as we can
		this.#dom.likeCount.textContent = likes;

		if (hasLikes) {
			this._internals.states?.delete("empty");
		}
		else {
			this._internals.states?.add("empty");
			this.#dom.likers.innerHTML = `<slot name='empty'>${BlueskyLikes.templates.empty({ url: this.src })}</slot>`;
			return;
		}

		this.#data.likers = await getPostLikes(postUrl);

		// Render the likers
		let likerHTML = [];

		let likers = this.#data.likers ?? [];
		for (const liker of likers) {
			let { actor } = liker;
			likerHTML.push(BlueskyLikes.templates.user(actor));
		}

		let moreLikers = this.#data.likes - likers.length;
		if (moreLikers > 0) {
			likerHTML.push(
				BlueskyLikes.templates.more({ moreLikers, post: this.#data.post, url: this.src }),
			);
		}
		this.#dom.likers.innerHTML = likerHTML.join("");
	}

	get src () {
		return this.getAttribute("src");
	}

	set src (value) {
		this.setAttribute("src", value);
	}

	get observedAttributes () {
		return ["src"];
	}

	attributeChangedCallback (name, oldValue, newValue) {
		if (name === "src") {
			this.render();
		}
	}
}

customElements.define("bluesky-likes", BlueskyLikes);
