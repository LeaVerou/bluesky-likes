import { getPost } from "../api.js";
import { styles, templates } from "./ui.js";

/**
 * @customElement bluesky-likes
 * @element bluesky-likes
 *
 * Displays the number of likes on a post and links to the full list.
 *
 * @attr {string} src - The URL of the post to display likes for. This is the only required attribute and must be a valid Bluesky post URL.
 *
 * @prop {BlueskyPost | undefined} post - The Bluesky post data containing information about the post, including its author, content, and engagement metrics
 * @prop {number} likes - The number of likes on the post
 * @prop {string} likersUrl - The URL to view the post's likers
 *
 * @slot - Content added after the likes count, typically used for additional information or actions
 * @slot prefix - Custom icon to replace the default heart icon. The icon should be an inline SVG or image element.
 *
 * @csspart count - The element that displays the likes count, formatted according to the user's locale
 * @csspart link - The link to view the post's likers, automatically removed if the component is placed inside another link
 * @csspart icon - The default heart icon which is displayed if nothing is slotted in the prefix slot
 *
 * @state loading - Indicates that the component is currently loading data from the Bluesky API
 */
export default class BlueskyLikes extends HTMLElement {
	static templates = templates;
	static styles = styles;
	static sheet;

	data = {};
	#dom = {};

	constructor () {
		super();
		this.attachShadow({ mode: "open" });
		this._internals = this.attachInternals?.();

		let { templates, styles, sheet } = this.constructor;

		if (this.shadowRoot.adoptedStyleSheets) {
			if (!sheet) {
				sheet = new CSSStyleSheet();
				sheet.replaceSync(styles);
				this.constructor.sheet = sheet;
			}

			this.shadowRoot.adoptedStyleSheets = [sheet];
		}

		this._setShadowHTML(templates.root());

		this.init();
	}

	init () {
		this.#dom.count = this.shadowRoot.querySelector("[part~=count]");
		this.#dom.link = this.shadowRoot.querySelector("[part~=link]");
	}

	/**
	 * Set the shadow root’s innerHTML.
	 * @protected
	 * @param {string} html
	 */
	_setShadowHTML (html) {
		if (!this.shadowRoot.adoptedStyleSheets && this.constructor.styles) {
			html = `<style>${this.constructor.styles}</style>\n${html}`;
		}

		this.shadowRoot.innerHTML = html;
	}

	connectedCallback () {
		// Polyfill for https://github.com/whatwg/html/issues/7039
		this._currentLang =
			this.lang ||
			this.parentNode.closest("[lang]")?.lang ||
			this.ownerDocument.documentElement.lang ||
			"en";

		// Only include a link iff the element is not within one
		this._isInLink = this.closest("a[href]") !== null;

		if (this._isInLink && this.#dom.link?.parentNode) {
			// Is inside a link, but we also have a link
			this.#dom.link.replaceWith(...this.#dom.link.childNodes);
		}
		else if (!this._isInLink && !this.#dom.link?.parentNode) {
			// Is not inside a link, but we don't have a link, (re-)insert it
			this._setShadowHTML(templates.root());
			this.init();
		}

		if (this.src) {
			this.render({ useCache: true });
		}
	}

	/**
	 * @returns {import("../api.js").BlueskyPost | undefined}
	 */
	get post () {
		return this.data.post;
	}

	/**
	 * @returns {number}
	 */
	get likes () {
		return this.data.post?.likeCount ?? 0;
	}

	get likersUrl () {
		return this.src + "/liked-by";
	}

	async fetch ({ force } = {}) {
		let postUrl = this.src;

		let post = await getPost(postUrl, { force });

		if (!post) {
			// Lazy loading?
			return;
		}

		this.data.post = post;

		return this.data;
	}

	async render ({ useCache = false } = {}) {
		this._internals.states?.add("loading");

		if (this._isInsideLink) {
			// Remove link from the DOM
		}
		else {
			this.#dom.link.href = this.likersUrl;
		}

		if (!this.data.post || !useCache) {
			await this.fetch({ force: !useCache });
		}

		if (this.data.post && this.#dom.count) {
			this.#dom.count.value = this.likes;
			this.#dom.count.textContent = this.likes.toLocaleString(this._currentLang, {
				notation: "compact",
			});
		}
		this._internals.states?.delete("loading");
	}

	get src () {
		return this.getAttribute("src");
	}

	set src (value) {
		this.setAttribute("src", value);
	}

	static get observedAttributes () {
		return ["src"];
	}

	attributeChangedCallback (name, oldValue, newValue) {
		if (name === "src") {
			this.render();
		}
	}
}

if (!customElements.get("bluesky-likes")) {
	customElements.define("bluesky-likes", BlueskyLikes);
}
