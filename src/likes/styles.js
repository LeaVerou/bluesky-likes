export default `
:host {
	display: inline-flex;
	gap: 0.25em;
	vertical-align: -.4em;
	color: #1185fe;
	border: .1em solid currentColor;
	border-radius: 0.25em;
	padding: 0.1em 0.4em;
	text-decoration: none;
}

[part=icon] {
	inline-size: 1.2em;
	vertical-align: -0.2em;
}

#count {
	font-weight: bold;
	color: var(--likes-color-text);
}
`;
