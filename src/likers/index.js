import BlueskyLikes from "../likes/index.js";
import { getPostLikes } from "../api.js";
import { styles, templates } from "./ui.js";

/**
 * @customElement bluesky-likers
 * @element bluesky-likers
 *
 * Displays the avatars of users who liked a post up to a max limit, and the number of additional users not shown.
 *
 * @attr {string} src - The URL of the post to display likes for. This is the only required attribute and must be a valid Bluesky post URL.
 * @attr {number} max - Maximum number of likers to display (default: 50). If the total number of likers exceeds this value, a "+N" indicator will be shown.
 *
 * @prop {BlueskyLike[]} likers - Array of users who liked the post, limited by the max attribute. Each user object contains their handle, display name, and avatar URL.
 * @prop {number} hiddenCount - The number of additional likers not shown in the list, calculated as the difference between total likes and the number of displayed likers
 *
 * @slot - Visually hidden content for screen reader users, providing additional context about the likers
 * @slot empty - Content displayed when there are no likers, defaults to a message with a link to the post
 *
 * @csspart avatar - The circular element that displays a user's avatar or the "+N" indicator for additional likers
 * @csspart avatar-img - The img element for users with an avatar, with lazy loading enabled
 * @csspart link - The a element that wraps each entry, providing hover and focus states
 * @csspart profile-link - The a element that links to the user's profile on Bluesky
 * @csspart more - The a element that displays the hidden count and links to the full list of likers
 *
 * @cssproperty --avatar-size - The size of each avatar (default: calc(2em + 1vw))
 * @cssproperty --bluesky-likers-avatar-size - The size of the avatar images (inherits from --avatar-size)
 * @cssproperty --avatar-overlap-percentage - The percentage of horizontal overlap between avatars (default: 0.3)
 * @cssproperty --avatar-overlap-percentage-y - The percentage of vertical overlap between avatars (default: 0.2)
 * @cssproperty --avatar-border - The border style for each avatar (default: .15em solid canvas)
 * @cssproperty --avatar-shadow - The box-shadow applied to each avatar (default: 0 .1em .4em -.3em rgb(0 0 0 / 0.4))
 * @cssproperty --avatar-background - The background for avatars without a user image (default: SVG data URL with a default avatar)
 * @cssproperty --more-background - The background color for the "+N" (more) avatar (default: #1185fe)
 * @cssproperty --more-color-text - The text color for the "+N" (more) avatar (default: white)
 * @cssproperty --avatar-overlap - The actual horizontal overlap between avatars (calculated from --avatar-size and --avatar-overlap-percentage)
 * @cssproperty --avatar-overlap-y - The actual vertical overlap between avatars (calculated from --avatar-size and --avatar-overlap-percentage-y)
 *
 * @state loading - Indicates that the component is currently loading data from the Bluesky API
 * @state empty - Indicates that there are no likers to display, showing the empty slot content
 */
export default class BlueskyLikers extends BlueskyLikes {
	static templates = templates;
	static styles = styles;
	static sheet;

	/**
	 * Set to true once the first instance of the component is created.
	 * @type {boolean}
	 * @private
	 */
	static _initialized = false;
	data = {};

	constructor () {
		super();
		this.constructor.init();
	}

	static init () {
		if (this._initialized) {
			return;
		}

		this._initialized = true;

		// Register the CSS custom property for the avatar size
		// @property in Shadow DOM is not yet supported, we need to register it in the light DOM
		globalThis?.CSS?.registerProperty?.({
			name: "--bluesky-likers-avatar-size",
			initialValue: "48px",
			syntax: "<length>",
			inherits: true,
		});
	}

	/**
	 * @returns {import("../api.js").BlueskyLike[]}
	 */
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

			this._setShadowHTML(
				templates.root({
					likers,
					hiddenCount: this.hiddenCount,
					post: this.data.post,
					url: this.src,
					element: this,
				}),
			);
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
