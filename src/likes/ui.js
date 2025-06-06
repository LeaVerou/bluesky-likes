let url = import.meta.url;

export const templates = {
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

export const styles = `
:host {
	display: inline-flex;
	gap: 0.25em;
	color: #1185fe;
	border: max(1px, .07em) solid currentColor;
	border-radius: 0.25em;
	padding: 0.15em 0.3em;
	text-decoration: none;
	font-weight: bold;
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

[part=icon] {
	block-size: 1em;
	vertical-align: -0.16em;
}
`;
