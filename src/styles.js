export default `
:host {
	--avatar-size: 3em;
	--avatar-overlap-percentage: 0.3;
	--avatar-overlap-percentage-y: 0.2;
	--avatar-border: .15em solid canvas;
	--avatar-shadow: 0 .1em .4em -.3em rgb(0 0 0 / 0.4);
	--more-color-background: #0070ff;
	--more-color-text: white;
	--likes-color-text: #0070ff;

	--avatar-overlap: calc(var(--avatar-size) * var(--avatar-overlap-percentage));
	--avatar-overlap-y: calc(var(--avatar-size) * var(--avatar-overlap-percentage-y));

	display: block;
}

a {
	text-decoration: none;
	color: inherit;
}

#link {
	font-size: 1.25em;
}

#link [part=icon] {
	inline-size: 1.2em;
	vertical-align: -0.2em;
}

#like_count {
	font-weight: bold;
	color: var(--likes-color-text);
}

#likers {
	list-style: none;
	display: block;
	padding: 0;
	padding-inline-start: var(--avatar-overlap);
	padding-block-start: var(--avatar-overlap-y);
	margin-block-start: .5rem;

	contain: inline-size;
	container-name: likers;

	> li {
		display: inline-flex;
		vertical-align: middle;
		margin-inline-start: calc(-1 * var(--avatar-overlap));
		margin-block-start: calc(-1 * var(--avatar-overlap-y));

		> a {
			vertical-align: middle;
			position: relative;
			display: flex;

			&:hover,
			&:focus {
				z-index: 1;
			}
		}
	}

	[part~="avatar"] {
		display: block;
		inline-size: var(--avatar-size);
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 50%;
		box-shadow: var(--avatar-shadow);
		border: var(--avatar-border);
		background-color: canvas;
	}

	[part~="more"] {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--more-color-background);
		color: var(--more-color-text);
		font-weight: 600;
		letter-spacing: -.03em;
	}
}
`;
