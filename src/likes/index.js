import { getPost } from "../bsky.js";
import styles from "./styles.js";

let url = import.meta.url;

const templates = {
	root () {
		let defaultIcon = url
			? `<img src="${new URL("../../logo.svg", url)}" alt="🦋" part="icon" />`
			: "🦋";
		return `
			<a target="_blank" id="link" part="link">
				<slot name="icon">${defaultIcon}</slot>
				<span part="count">0</span>
				<slot></slot>
			</a>`;
	},
};

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
		this.render({ useCache: true });
	}

	get post () {
		return this.data.post;
	}

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
		this.#dom.link.href = this.likersUrl;

		if (!this.data.post || !useCache) {
			await this.fetch({ force: !useCache });
		}

		if (this.data.post && this.#dom.count) {
			this.#dom.count.textContent = this.likes;
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

customElements.define("bluesky-likes", BlueskyLikes);
