import BlueskyLikes from "../likes/index.js";
import { getPost, getPostLikes } from "../bsky.js";
import styles from "./styles.js";
import templates from "./templates.js";

export default class BlueskyLikers extends BlueskyLikes {
	static templates = templates;
	static styles = styles;
	static sheet;
	data = {};

	get likers () {
		return this.data.likers ?? [];
	}

	get hiddenCount () {
		return this.likes - this.likers.length;
	}

	async fetch ({ force } = {}) {
		await super.fetch({ force });

		if (this.data.post) {
			this.data.likers = await getPostLikes(this.src, { force });
		}
	}

	async render ({ useCache = false } = {}) {
		if (!this.data.likers || useCache) {
			await this.fetch({ force: !useCache });
		}

		if (!this.data.likers) {
			return;
		}

		let likes = this.likes;
		let hasLikes = likes > 0;

		let { templates } = this.constructor;

		if (hasLikes) {
			this._internals.states?.delete("empty");
		}
		else {
			this._internals.states?.add("empty");
			this._setShadowHTML(`<slot name='empty'>${templates.empty({ url: this.src })}</slot>`);
			return;
		}

		// Render the likers
		let likers = this.data.likers ?? [];
		let html = likers.map(liker => templates.user(liker));

		if (this.hiddenCount > 0) {
			html.push(
				templates.more({
					hiddenCount: this.hiddenCount,
					post: this.data.post,
					url: this.src,
				}),
			);
		}

		this._setShadowHTML(html.join(" "));
	}

	get max () {
		return Number(this.getAttribute("max") || 100);
	}

	set max (value) {
		this.setAttribute("max", value);
	}

	get observedAttributes () {
		return [...super.observedAttributes, "max"];
	}

	attributeChangedCallback (name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);

		if (name === "max") {
			this.render({ useCache: true });
		}
	}
}

customElements.define("bluesky-likers", BlueskyLikers);
