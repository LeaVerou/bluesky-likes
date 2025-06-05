export default `
:host {
	display: inline-flex;
	gap: 0.25em;
	color: #1185fe;
	border: max(1px, .08em) solid currentColor;
	border-radius: 0.25em;
	padding: 0.2em 0.35em;
	text-decoration: none;
}

@keyframes loading {
	from { opacity: 0.5; }
	to { opacity: 0.8; }
}

:host(:state(loading)) #count {
	animation: loading 1s infinite alternate;
}

a {
	color: inherit;
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
