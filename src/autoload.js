export const components = ["likes", "likers"];
let observer = null;

if (globalThis.document) {
	discover(document.body);
}

export function observe (node) {
	observer ??= new MutationObserver(mutations => {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					discover(node);
				}
			}
		}
	});
	observer.observe(node, { childList: true, subtree: true });
}

export function unobserve (node) {
	observer.unobserve(node);
}

export function discover (node) {
	for (let i = 0; i < components.length; i++) {
		let component = components[i];
		let tag = `bluesky-${component}`;
		let isRegistered = Boolean(customElements.get(tag));

		if (isRegistered) {
			// Only check components that are not already defined
			components.splice(i, 1);
			i--;
			continue;
		}

		if (node.querySelector(tag) || node.matches?.(tag)) {
			import(`./${component}/index.js`);
			components.splice(i, 1);
			i--;
		}
	}

	if (components.length === 0 && observer) {
		// Nothing left to do here
		observer.disconnect();
		observer = null;
	}
}
