let url = import.meta.url;

export const templates = {
	root () {
		let defaultIcon = url
			? `<img src="${new URL("../../logo.svg", url)}" alt="" part="icon" />`
			: "🦋";
		return `
			<a target="_blank" id="link" part="link" title="View all Bluesky likes">
				<slot name="prefix">${defaultIcon}</slot>
				<data value="0" part="count">0</data>
				<slot></slot>
			</a>`;
	},
};

export const styles = `
:host {
	display: inline-flex;
	gap: 0.25em;
	align-items: center;
	color: #1185fe;
	border: max(1px, .07em) solid currentColor;
	border-radius: 0.25em;
	padding: 0.25em 0.3em;
	text-decoration: none;
	font-weight: bold;
	line-height: 1;
}

@keyframes loading {
	from { opacity: 0.5; }
	to { opacity: 0.8; }
}

:host(:state(loading)) {
	animation: loading 1s infinite alternate;
}

a {
	color: inherit;
	text-decoration: none;
}

:host:has(a:hover) {
	background: lab(from currentColor l a b / 0.1);
}

[part=icon] {
	block-size: 1em;
	vertical-align: -0.16em;
}
`;
