import BlueskyLikes from "../likes/index.js";
import { getPost, getPostLikes } from "../api.js";
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

	hiddenCount = 0;

	async fetch ({ force } = {}) {
		await super.fetch({ force });

		if (this.data.post) {
			this.data.likers = await getPostLikes(this.src, { force, limit: this.max });
		}

		return this.data;
	}

	async render ({ useCache = false } = {}) {
		this._internals.states?.add("loading");
		if (!this.data.likers || !useCache) {
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

			// Render the likers
			let likers = this.data.likers ?? [];
			let max = this.max;

			if (likers.length > max) {
				likers = likers.slice(0, max);
			}

			this.hiddenCount = likes - likers.length;

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
		else {
			this._internals.states?.add("empty");

			this._setShadowHTML(`<slot name='empty'>${templates.empty({ url: this.src })}</slot>`);
		}

		this._internals.states?.delete("loading");
	}

	get max () {
		return Number(this.getAttribute("max") || 50);
	}

	set max (value) {
		this.setAttribute("max", value);
	}

	static get observedAttributes () {
		return [...super.observedAttributes, "max"];
	}

	attributeChangedCallback (name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);

		if (name === "max") {
			let oldMax = oldValue === null ? 50 : Number(oldValue);
			this.render({ useCache: oldMax <= newValue });
		}
	}
}

if (!customElements.get("bluesky-likers")) {
	customElements.define("bluesky-likers", BlueskyLikers);
}
