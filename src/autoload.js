const components = ["likes", "likers"];

if (globalThis.document) {
	for (let component of components) {
		let tag = `bluesky-${component}`;
		if (document.querySelector(tag)) {
			import(`./${component}/index.js`);
		}
	}
}
