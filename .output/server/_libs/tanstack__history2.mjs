// node_modules/@tanstack/history/dist/esm/index.js
var stateIndexKey = "__TSR_index";
/**
* Turn protocol-relative inputs such as "//evil.example" into paths
* such as "/evil.example", keeping navigation on the current origin.
*
* For HTTP(S) URLs, WHATWG parsing ignores leading C0 controls and spaces,
* removes tabs/newlines, and treats backslashes as slashes, so inputs like
* "/\evil.example" also need normalization. This only allocates when those
* rules would make the input protocol-relative.
*/
var protocolRelativePrefix = /^[\x00-\x20]*(?:[\\/][\t\n\r]*){2,}/;
function normalizeProtocolRelative(url) {
	const match = protocolRelativePrefix.exec(url);
	return match ? "/" + url.slice(match[0].length) : url;
}
function normalizeHref(href) {
	if (/[\x00-\x1f\x7f]/.test(href)) href = href.replace(/[\x00-\x1f\x7f]/g, (character) => "	\n\r".includes(character) ? "" : encodeURIComponent(character));
	return normalizeProtocolRelative(href);
}
var noop = () => {};
var ServerHistory = class {
	constructor(location) {
		this.location = location;
	}
	get length() {
		return 1;
	}
	get subscribers() {
		return this._subscribers ??= /* @__PURE__ */ new Set();
	}
	subscribe() {
		return noop;
	}
	push() {}
	replace() {}
	go() {}
	back() {}
	forward() {}
	canGoBack() {
		return false;
	}
	createHref(href) {
		return normalizeHref(href);
	}
	block() {
		return noop;
	}
	flush() {}
	destroy() {}
	notify() {}
	_getBlockers() {
		return [];
	}
};
/** A fixed request location; server navigation is a no-op. */
function createServerHistory(href) {
	return new ServerHistory(parseHref(href, void 0));
}
function parseHref(href, state) {
	const sanitizedHref = normalizeHref(href);
	const hashIndex = sanitizedHref.indexOf("#");
	const searchIndex = sanitizedHref.indexOf("?");
	if (!state) {
		const key = createRandomKey();
		state = {
			[stateIndexKey]: 0,
			key,
			__TSR_key: key
		};
	}
	return {
		href: sanitizedHref,
		pathname: sanitizedHref.slice(0, hashIndex > -1 ? searchIndex > -1 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > -1 ? searchIndex : sanitizedHref.length),
		hash: hashIndex > -1 ? sanitizedHref.slice(hashIndex) : "",
		search: searchIndex > -1 ? sanitizedHref.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
		state
	};
}
function createRandomKey() {
	return (Math.random() + 1).toString(36).slice(7);
}
export { createServerHistory };
