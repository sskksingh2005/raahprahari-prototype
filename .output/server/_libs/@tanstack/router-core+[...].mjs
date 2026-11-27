// node_modules/cookie-es/dist/index.mjs
var COOKIE_MAX_AGE_LIMIT = 3456e4;
var maxAgeRegExp = /^-?\d+$/;
var _nullProto = /* @__PURE__ */ Object.getPrototypeOf({});
function parseSetCookie(str, options) {
	const len = str.length;
	let _endIdx = len;
	let eqIdx = -1;
	for (let i = 0; i < len; i++) {
		const c = str.charCodeAt(i);
		if (c === 59) {
			_endIdx = i;
			break;
		}
		if (c === 61 && eqIdx === -1) eqIdx = i;
	}
	if (eqIdx >= _endIdx) eqIdx = -1;
	const name = eqIdx === -1 ? "" : _trim(str, 0, eqIdx);
	if (name && name in _nullProto) return void 0;
	let value = eqIdx === -1 ? _trim(str, 0, _endIdx) : _trim(str, eqIdx + 1, _endIdx);
	if (!name && !value) return void 0;
	if (name.length + value.length > 4096) return void 0;
	if (options?.decode !== false) value = _decode(value, options?.decode);
	const setCookie = {
		name,
		value
	};
	let index = _endIdx + 1;
	while (index < len) {
		let endIdx = len;
		let attrEqIdx = -1;
		for (let i = index; i < len; i++) {
			const c = str.charCodeAt(i);
			if (c === 59) {
				endIdx = i;
				break;
			}
			if (c === 61 && attrEqIdx === -1) attrEqIdx = i;
		}
		if (attrEqIdx >= endIdx) attrEqIdx = -1;
		const attr = attrEqIdx === -1 ? _trim(str, index, endIdx) : _trim(str, index, attrEqIdx);
		const val = attrEqIdx === -1 ? void 0 : _trim(str, attrEqIdx + 1, endIdx);
		if (val === void 0 || val.length <= 1024) switch (attr.toLowerCase()) {
			case "httponly":
				setCookie.httpOnly = true;
				break;
			case "secure":
				setCookie.secure = true;
				break;
			case "partitioned":
				setCookie.partitioned = true;
				break;
			case "domain":
				if (val) setCookie.domain = (val.charCodeAt(0) === 46 ? val.slice(1) : val).toLowerCase();
				break;
			case "path":
				setCookie.path = val;
				break;
			case "max-age":
				if (val && maxAgeRegExp.test(val)) setCookie.maxAge = Math.min(Number(val), COOKIE_MAX_AGE_LIMIT);
				break;
			case "expires": {
				if (!val) break;
				const date = new Date(val);
				if (Number.isFinite(date.valueOf())) {
					const maxDate = new Date(Date.now() + COOKIE_MAX_AGE_LIMIT * 1e3);
					setCookie.expires = date > maxDate ? maxDate : date;
				}
				break;
			}
			case "priority": {
				if (!val) break;
				const priority = val.toLowerCase();
				if (priority === "low" || priority === "medium" || priority === "high") setCookie.priority = priority;
				break;
			}
			case "samesite": {
				if (!val) break;
				const sameSite = val.toLowerCase();
				if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") setCookie.sameSite = sameSite;
				else setCookie.sameSite = "lax";
				break;
			}
			default: {
				const attrLower = attr.toLowerCase();
				if (attrLower && !(attrLower in _nullProto)) setCookie[attrLower] = val;
			}
		}
		index = endIdx + 1;
	}
	return setCookie;
}
function _trim(str, start, end) {
	if (start === end) return "";
	let s = start;
	let e = end;
	while (s < e && (str.charCodeAt(s) === 32 || str.charCodeAt(s) === 9)) s++;
	while (e > s && (str.charCodeAt(e - 1) === 32 || str.charCodeAt(e - 1) === 9)) e--;
	return str.slice(s, e);
}
function _decode(value, decode) {
	if (!decode && !value.includes("%")) return value;
	try {
		return (decode || decodeURIComponent)(value);
	} catch {
		return value;
	}
}
function splitSetCookieString(cookiesString) {
	if (Array.isArray(cookiesString)) return cookiesString.flatMap((c) => splitSetCookieString(c));
	if (typeof cookiesString !== "string") return [];
	const cookiesStrings = [];
	let pos = 0;
	let start;
	let ch;
	let lastComma;
	let nextStart;
	let cookiesSeparatorFound;
	const skipWhitespace = () => {
		while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
		return pos < cookiesString.length;
	};
	const notSpecialChar = () => {
		ch = cookiesString.charAt(pos);
		return ch !== "=" && ch !== ";" && ch !== ",";
	};
	while (pos < cookiesString.length) {
		start = pos;
		cookiesSeparatorFound = false;
		while (skipWhitespace()) {
			ch = cookiesString.charAt(pos);
			if (ch === ",") {
				lastComma = pos;
				pos += 1;
				skipWhitespace();
				nextStart = pos;
				while (pos < cookiesString.length && notSpecialChar()) pos += 1;
				if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
					cookiesSeparatorFound = true;
					pos = nextStart;
					cookiesStrings.push(cookiesString.slice(start, lastComma));
					start = pos;
				} else pos = lastComma + 1;
			} else pos += 1;
		}
		if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.slice(start));
	}
	return cookiesStrings;
}
// node_modules/@tanstack/router-core/dist/esm/not-found.js
/** Determine if a value is a TanStack Router not-found error. */
function isNotFound(obj) {
	return obj?.isNotFound === true;
}
// node_modules/@tanstack/router-core/dist/esm/root.js
/** Stable identifier used for the root route in a route tree. */
var rootRouteId = "__root__";
// node_modules/@tanstack/router-core/dist/esm/redirect.js
/** Check whether a value is a TanStack Router redirect Response. */
function isRedirect(obj) {
	return obj instanceof Response && !!obj.options;
}
// node_modules/@tanstack/router-core/dist/esm/ssr/ssr-match-id.js
function dehydrateSsrMatchId(id) {
	return id.replaceAll("/", "#");
}
// node_modules/@tanstack/router-core/dist/esm/sieve-cache.js
/**
* A fixed-capacity cache using the SIEVE eviction algorithm
* (https://cachemon.github.io/SIEVE-website/).
*
* Entries live in the Map's FIFO insertion order; a hit only flips a `visited`
* bit instead of relinking the entry, which makes `get` (by far the hottest
* operation here) one `Map.get` plus a boolean store. Eviction sweeps a `hand`
* from the oldest entry towards the newest, clearing `visited` bits until it
* finds an unvisited entry to drop, so entries touched since the last sweep
* survive one more round. This keeps LRU-like hit ratios while being
* scan-resistant.
*/
function createSieveCache(max) {
	const cache = /* @__PURE__ */ new Map();
	let hand;
	let newest;
	return {
		get(key) {
			const entry = cache.get(key);
			if (!entry) return;
			entry.visited = true;
			return entry.value;
		},
		set(key, value) {
			const existing = cache.get(key);
			if (existing) {
				existing.value = value;
				return;
			}
			if (cache.size >= max) {
				let node = hand?.next().value;
				while (!node || node.visited) {
					if (node) node.visited = false;
					else hand = cache.values();
					node = hand.next().value;
				}
				if (node === newest) hand = void 0;
				cache.delete(node.key);
			}
			const entry = {
				key,
				value,
				visited: false
			};
			newest = entry;
			cache.set(key, entry);
		},
		clear() {
			cache.clear();
			hand = void 0;
			newest = void 0;
		}
	};
}
// node_modules/@tanstack/router-core/dist/esm/invariant.js
function invariant() {
	throw new Error("Invariant failed");
}
// node_modules/@tanstack/router-core/dist/esm/load-client.js
/** Return the structural lane through the first terminal render boundary. */
function _getRenderedMatches(matches) {
	const end = matches.findIndex((match) => match.status !== "success" || match._notFound) + 1;
	return end && end < matches.length ? matches.slice(0, end) : matches;
}
// node_modules/@tanstack/router-core/dist/esm/await-signal.js
function observeLate(callback, value) {
	if (!callback) return;
	try {
		const result = callback(value);
		if (result !== void 0) Promise.resolve(result).catch(() => {});
	} catch {}
}
/**
* Await `value` unless `signal` aborts first. A result that settles after the
* abort is passed to `onLate` / `onLateError` instead.
*
* One abort listener per wait: SSR requests nest at most a few waits on one
* signal, so pooling them was measurably slower than this.
*/
function waitForReason(value, signal, onLate, onLateError) {
	const promise = Promise.resolve(value);
	if (signal.aborted) {
		promise.then((result) => observeLate(onLate, result), (error) => observeLate(onLateError, error));
		return Promise.reject(signal.reason);
	}
	return new Promise((resolve, reject) => {
		const abort = () => reject(signal.reason);
		signal.addEventListener("abort", abort, { once: true });
		promise.then((result) => {
			signal.removeEventListener("abort", abort);
			if (signal.aborted) observeLate(onLate, result);
			else resolve(result);
		}, (error) => {
			signal.removeEventListener("abort", abort);
			if (signal.aborted) observeLate(onLateError, error);
			else reject(error);
		});
	});
}
// node_modules/@tanstack/router-core/dist/esm/utils.js
function isPromise(value) {
	return Boolean(value && typeof value === "object" && typeof value.then === "function");
}
/**
* Re-encode characters that are unsafe in URL paths.
* Includes ASCII control characters (0x00-0x1F, 0x7F) and a subset of the
* WHATWG URL "path percent-encode set" (", <, >, `, {, }).
*
* Space (0x20) is intentionally excluded — decodeURI decodes %20 to space
* and the router stores decoded spaces in location.pathname. The existing
* encodePathLikeUrl already handles re-encoding spaces for outgoing URLs.
*
* These characters are decoded by decodeURI but must remain percent-encoded
* in paths to match how upstream layers (CDNs, edge middleware, browsers)
* interpret the URL, preventing infinite redirect loops and path mismatches.
*/
var PATH_UNSAFE_RE = /[\x00-\x1f\x7f"<>`{}]/g;
function sanitizePathSegment(segment) {
	return segment.replace(PATH_UNSAFE_RE, (ch) => "%" + ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"));
}
function decodeSegment(segment) {
	let decoded;
	try {
		decoded = decodeURI(segment);
	} catch {
		decoded = segment.replaceAll(/%[0-9A-F]{2}/gi, (match) => {
			try {
				return decodeURI(match);
			} catch {
				return match;
			}
		});
	}
	return sanitizePathSegment(decoded);
}
/**
* Extract the explicit URL scheme, including its colon, using WHATWG
* normalization rules. This does not validate the rest of the URL.
*
* Returning `undefined` means "no explicit scheme", not "safe URL";
* protocol-relative URLs such as "//evil.example" require a separate check.
*/
function getUrlScheme(url) {
	if (url[0] === "/") return;
	if (!url.includes(":")) return;
	return /^[\x00-\x20]*([a-z][a-z\d+.\t\n\r-]*:)/i.exec(url)?.[1]?.replace(/[\t\n\r]/g, "").toLowerCase();
}
var protocolRelativePrefixRegex = /^[\x00-\x20]*[\\/][\t\n\r]*[\\/]/;
/**
* Check if a URL string uses a protocol that is not in the allowlist or is
* protocol-relative (e.g. "//evil.example"), which can navigate to another host.
* Returns true for blocked protocols like javascript:, blob:, and data:, as
* well as slash/backslash variants of protocol-relative URLs.
*
* Scheme parsing normalizes:
* - Mixed case (JavaScript: → javascript:)
* - Whitespace/control characters (java\nscript: → javascript:)
* - Leading whitespace
*
* For relative URLs without a protocol-relative prefix, returns false.
*
* @param url - The URL string to check
* @param allowlist - Set of protocols to allow
* @returns true if the URL uses a protocol that is not allowed or can escape
* the current origin through a protocol-relative URL
*/
function isDangerousProtocol(url, allowlist) {
	if (!url) return false;
	if (protocolRelativePrefixRegex.test(url)) return true;
	const scheme = getUrlScheme(url);
	return scheme ? !allowlist.has(scheme) : false;
}
function decodePath(path) {
	if (!path) return path;
	let result = path;
	if (/[%\\\x00-\x1f\x7f]/.test(path)) {
		const re = /%25|%5C/gi;
		let cursor = 0;
		let match;
		result = "";
		while (null !== (match = re.exec(path))) {
			result += decodeSegment(path.slice(cursor, match.index)) + match[0];
			cursor = re.lastIndex;
		}
		result += decodeSegment(cursor ? path.slice(cursor) : path);
	}
	return result;
}
// node_modules/@tanstack/router-core/dist/esm/manifest.js
function getAssetCrossOrigin(assetCrossOrigin, kind) {
	if (!assetCrossOrigin) return;
	if (typeof assetCrossOrigin === "string") return assetCrossOrigin;
	return assetCrossOrigin[kind];
}
function getManifestScriptFormat(manifest) {
	return manifest?.scriptFormat ?? "module";
}
function getScriptPreloadAttrs(manifest, link, assetCrossOrigin) {
	const preloadLink = resolveManifestAssetLink(link);
	const crossOrigin = getAssetCrossOrigin(assetCrossOrigin, "script") ?? preloadLink.crossOrigin;
	return {
		...getManifestScriptFormat(manifest) === "iife" ? {
			rel: "preload",
			as: "script"
		} : { rel: "modulepreload" },
		href: preloadLink.href,
		fetchPriority: "low",
		...crossOrigin ? { crossOrigin } : {}
	};
}
function resolveManifestAssetLink(link) {
	if (typeof link === "string") return {
		href: link,
		crossOrigin: void 0
	};
	return link;
}
function getStylesheetHref(asset) {
	return resolveManifestCssLink(asset).href;
}
function resolveManifestCssLink(link) {
	if (typeof link === "string") return {
		href: link,
		crossOrigin: void 0
	};
	return link;
}
function createInlineCssStyleAsset(css) {
	return {
		attrs: { suppressHydrationWarning: true },
		children: css
	};
}
function createInlineCssPlaceholderAsset() {
	return { attrs: { suppressHydrationWarning: true } };
}
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/transformer.js
/**
* Create a strongly-typed serialization adapter for SSR hydration.
* Use to register custom types with the router serializer.
*/
function createSerializationAdapter(opts) {
	return opts;
}
// node_modules/seroval/dist/index.js
var SYM_ASYNC_ITERATOR = Symbol.asyncIterator;
var SYM_HAS_INSTANCE = Symbol.hasInstance;
var SYM_IS_CONCAT_SPREADABLE = Symbol.isConcatSpreadable;
var SYM_ITERATOR = Symbol.iterator;
var SYM_MATCH = Symbol.match;
var SYM_MATCH_ALL = Symbol.matchAll;
var SYM_REPLACE = Symbol.replace;
var SYM_SEARCH = Symbol.search;
var SYM_SPECIES = Symbol.species;
var SYM_SPLIT = Symbol.split;
var SYM_TO_PRIMITIVE = Symbol.toPrimitive;
var SYM_TO_STRING_TAG = Symbol.toStringTag;
var SYM_UNSCOPABLES = Symbol.unscopables;
var TEMPORAL_TYPE_NAME = {
	[0]: "Instant",
	[1]: "Duration",
	[2]: "PlainDate",
	[3]: "PlainDateTime",
	[4]: "PlainMonthDay",
	[5]: "PlainTime",
	[6]: "PlainYearMonth",
	[7]: "ZonedDateTime"
};
var SYMBOL_REF = {
	[0]: SYM_ASYNC_ITERATOR,
	[1]: SYM_HAS_INSTANCE,
	[2]: SYM_IS_CONCAT_SPREADABLE,
	[3]: SYM_ITERATOR,
	[4]: SYM_MATCH,
	[5]: SYM_MATCH_ALL,
	[6]: SYM_REPLACE,
	[7]: SYM_SEARCH,
	[8]: SYM_SPECIES,
	[9]: SYM_SPLIT,
	[10]: SYM_TO_PRIMITIVE,
	[11]: SYM_TO_STRING_TAG,
	[12]: SYM_UNSCOPABLES
};
function createSymbolStringTable() {
	const result = {};
	for (let i = 0; i <= 12; i++) result[i] = SYMBOL_REF[i].description;
	return result;
}
var SYMBOL_STRING = /* @__PURE__ */ createSymbolStringTable();
function createInverseSymbolTable() {
	const result = {};
	for (let i = 0; i <= 12; i++) result[SYMBOL_REF[i]] = i;
	return result;
}
var INV_SYMBOL_REF = /* @__PURE__ */ createInverseSymbolTable();
var CONSTANT_STRING = {
	[2]: "!0",
	[3]: "!1",
	[1]: "void 0",
	[0]: "null",
	[4]: "-0",
	[5]: "1/0",
	[6]: "-1/0",
	[7]: "0/0"
};
var CONSTANT_VAL = {
	[2]: true,
	[3]: false,
	[1]: void 0,
	[0]: null,
	[4]: -0,
	[5]: Infinity,
	[6]: -Infinity,
	[7]: NaN
};
var ERROR_CONSTRUCTOR = {
	[0]: Error,
	[1]: EvalError,
	[2]: RangeError,
	[3]: ReferenceError,
	[4]: SyntaxError,
	[5]: TypeError,
	[6]: URIError
};
function createErrorConstructorStringTable() {
	const result = {};
	for (let i = 0; i <= 6; i++) result[i] = ERROR_CONSTRUCTOR[i].name;
	return result;
}
var ERROR_CONSTRUCTOR_STRING = /* @__PURE__ */ createErrorConstructorStringTable();
function createSerovalNode(t, i, s, c, m, p, e, a, f, b, o, l) {
	if (c === void 0 && m === void 0 && p === void 0 && e === void 0 && a === void 0 && f === void 0 && b === void 0 && o === void 0 && l === void 0) return {
		t,
		i,
		s
	};
	return {
		t,
		i,
		s,
		c,
		m,
		p,
		e,
		a,
		f,
		b,
		o,
		l
	};
}
function createConstantNode(value) {
	return createSerovalNode(2, void 0, value);
}
var TRUE_NODE = /* @__PURE__ */ createConstantNode(2);
var FALSE_NODE = /* @__PURE__ */ createConstantNode(3);
var UNDEFINED_NODE = /* @__PURE__ */ createConstantNode(1);
var NULL_NODE = /* @__PURE__ */ createConstantNode(0);
var NEG_ZERO_NODE = /* @__PURE__ */ createConstantNode(4);
var INFINITY_NODE = /* @__PURE__ */ createConstantNode(5);
var NEG_INFINITY_NODE = /* @__PURE__ */ createConstantNode(6);
var NAN_NODE = /* @__PURE__ */ createConstantNode(7);
var MIN_JSON_STRINGIFY_LENGTH = 64;
var NEEDS_ESCAPE = /["\\\n\r\b\t\f<\u2028\u2029]/;
var JSON_ESCAPE_DIFFERENCES = /[\x00-\x07\x0b\x0e-\x1f\ud800-\udfff]/;
var LESS_THAN = /</g;
var LINE_SEPARATOR = /\u2028/g;
var PARAGRAPH_SEPARATOR = /\u2029/g;
function escapeCharCode(code) {
	switch (code) {
		case 34: return "\\\"";
		case 92: return "\\\\";
		case 10: return "\\n";
		case 13: return "\\r";
		case 8: return "\\b";
		case 9: return "\\t";
		case 12: return "\\f";
		case 60: return "\\x3C";
		case 8232: return "\\u2028";
		case 8233: return "\\u2029";
		default: return;
	}
}
function serializeString(str) {
	if (!NEEDS_ESCAPE.test(str)) return str;
	if (str.length >= MIN_JSON_STRINGIFY_LENGTH && !JSON_ESCAPE_DIFFERENCES.test(str)) {
		let result = JSON.stringify(str).slice(1, -1);
		if (result.includes("<")) result = result.replace(LESS_THAN, "\\x3C");
		if (result.includes("\u2028")) result = result.replace(LINE_SEPARATOR, "\\u2028");
		if (result.includes("\u2029")) result = result.replace(PARAGRAPH_SEPARATOR, "\\u2029");
		return result;
	}
	let result = "";
	let lastPos = 0;
	let replacement;
	for (let i = 0, len = str.length; i < len; i++) {
		replacement = escapeCharCode(str.charCodeAt(i));
		if (replacement) {
			result += str.slice(lastPos, i) + replacement;
			lastPos = i + 1;
		}
	}
	return result + str.slice(lastPos);
}
var JSON_COMPATIBLE = /^(?:[^"\\\x00-\x1f]|\\["\\nrbtf])*$/;
var ESCAPE_SEQUENCE = /(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g;
function deserializeString(str) {
	if (typeof str !== "string") return str.replace(ESCAPE_SEQUENCE, deserializeString);
	let index = str.indexOf("\\");
	if (index === -1) return str;
	if (JSON_COMPATIBLE.test(str)) return JSON.parse("\"" + str + "\"");
	let result = "";
	let lastPos = 0;
	const last = str.length - 1;
	while (index !== -1 && index < last) {
		let replacement;
		let length = 2;
		switch (str.charCodeAt(index + 1)) {
			case 92:
				replacement = "\\";
				break;
			case 34:
				replacement = "\"";
				break;
			case 110:
				replacement = "\n";
				break;
			case 114:
				replacement = "\r";
				break;
			case 98:
				replacement = "\b";
				break;
			case 116:
				replacement = "	";
				break;
			case 102:
				replacement = "\f";
				break;
			case 120:
				if (str.startsWith("3C", index + 2)) {
					replacement = "<";
					length = 4;
				}
				break;
			case 117: if (str.startsWith("2028", index + 2)) {
				replacement = "\u2028";
				length = 6;
			} else if (str.startsWith("2029", index + 2)) {
				replacement = "\u2029";
				length = 6;
			}
		}
		if (replacement) {
			result += str.slice(lastPos, index) + replacement;
			lastPos = index + length;
			index = str.indexOf("\\", lastPos);
		} else index = str.indexOf("\\", index + 1);
	}
	return result + str.slice(lastPos);
}
var STEP_ERROR_CODES = {
	parsing: 1,
	serialization: 2,
	deserialization: 3
};
function getErrorMessageProd(type) {
	return `Seroval Error (step: ${STEP_ERROR_CODES[type]})`;
}
var SerovalError = class extends Error {
	constructor(type, cause) {
		super(getErrorMessageProd(type));
		this.cause = cause;
	}
};
var SerovalParserError = class extends SerovalError {
	constructor(cause) {
		super("parsing", cause);
	}
};
var SerovalSerializationError = class extends SerovalError {
	constructor(cause) {
		super("serialization", cause);
	}
};
var SerovalDeserializationError = class extends SerovalError {
	constructor(cause) {
		super("deserialization", cause);
	}
};
function getSpecificErrorMessage(code) {
	return `Seroval Error (specific: ${code})`;
}
var SerovalUnsupportedTypeError = class extends Error {
	constructor(value) {
		super(getSpecificErrorMessage(1));
		this.value = value;
	}
};
var SerovalUnsupportedNodeError = class extends Error {
	constructor(node) {
		super(getSpecificErrorMessage(2));
	}
};
var SerovalMissingPluginError = class extends Error {
	constructor(tag) {
		super(getSpecificErrorMessage(3));
	}
};
var SerovalMissingInstanceError = class extends Error {
	constructor(tag) {
		super(getSpecificErrorMessage(4));
	}
};
var SerovalMissingReferenceForIdError = class extends Error {
	constructor(id) {
		super(getSpecificErrorMessage(6));
	}
};
var SerovalUnknownTypedArrayError = class extends Error {
	constructor(name) {
		super(getSpecificErrorMessage(7));
	}
};
var SerovalMalformedNodeError = class extends Error {
	constructor(node) {
		super(getSpecificErrorMessage(8));
	}
};
var SerovalConflictedNodeIdError = class extends Error {
	constructor(node) {
		super(getSpecificErrorMessage(9));
	}
};
var SerovalDepthLimitError = class extends Error {
	constructor(limit) {
		super(getSpecificErrorMessage(10));
	}
};
var SerovalLiveStreamError = class extends Error {
	constructor(reason) {
		super(getSpecificErrorMessage(12));
		this.reason = reason;
	}
};
function getErrorConstructor(error) {
	for (let i = 1; i <= 6; i++) if (error instanceof ERROR_CONSTRUCTOR[i]) return i;
	return 0;
}
function getErrorOptions(error, features) {
	const options = Object.create(null);
	const construct = ERROR_CONSTRUCTOR_STRING[getErrorConstructor(error)];
	if (error.name !== construct) options.name = error.name;
	else if (error.constructor.name !== construct) options.name = error.constructor.name;
	for (const name of Object.getOwnPropertyNames(error)) if (name !== "name" && name !== "message" && (name !== "stack" || features & 4)) options[name] = error[name];
	return options;
}
function getObjectFlag(obj) {
	if (Object.isExtensible(obj)) return 0;
	if (Object.isFrozen(obj)) return 3;
	if (Object.isSealed(obj)) return 2;
	return 1;
}
function getTypedArrayConstructor(name) {
	switch (name) {
		case "Int8Array": return Int8Array;
		case "Int16Array": return Int16Array;
		case "Int32Array": return Int32Array;
		case "Uint8Array": return Uint8Array;
		case "Uint16Array": return Uint16Array;
		case "Uint32Array": return Uint32Array;
		case "Uint8ClampedArray": return Uint8ClampedArray;
		case "Float32Array": return Float32Array;
		case "Float64Array": return Float64Array;
		case "BigInt64Array": return BigInt64Array;
		case "BigUint64Array": return BigUint64Array;
		default: throw new SerovalUnknownTypedArrayError(name);
	}
}
var typedArrayNameGetter;
function getTypedArrayName(value) {
	if (!typedArrayNameGetter) typedArrayNameGetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Int8Array.prototype), Symbol.toStringTag).get;
	return typedArrayNameGetter.call(value);
}
function createNumberNode(value) {
	switch (value) {
		case Number.POSITIVE_INFINITY: return INFINITY_NODE;
		case Number.NEGATIVE_INFINITY: return NEG_INFINITY_NODE;
	}
	if (value !== value) return NAN_NODE;
	if (Object.is(value, -0)) return NEG_ZERO_NODE;
	return createSerovalNode(0, void 0, value);
}
function createStringNode(value) {
	return createSerovalNode(1, void 0, serializeString(value));
}
function createBigIntNode(current) {
	return createSerovalNode(3, void 0, "" + current);
}
function createIndexedValueNode(id) {
	return createSerovalNode(4, id);
}
function createDateNode(id, current) {
	const timestamp = current.valueOf();
	return createSerovalNode(5, id, timestamp === timestamp ? current.toISOString() : "");
}
function createTemporalNode(id, type, current) {
	return createSerovalNode(36, id, current.toString(), type);
}
function createRegExpNode(id, current) {
	return createSerovalNode(6, id, void 0, serializeString(current.source), current.flags);
}
function createWKSymbolNode(id, current) {
	return createSerovalNode(17, id, INV_SYMBOL_REF[current]);
}
function createReferenceNode(id, referenceId) {
	return createSerovalNode(18, id, serializeString(referenceId));
}
function createPluginNode(id, tag, value) {
	return createSerovalNode(25, id, value, serializeString(tag));
}
function createArrayNode(id, current, parsedItems) {
	return createSerovalNode(9, id, void 0, void 0, void 0, void 0, void 0, parsedItems, void 0, void 0, getObjectFlag(current));
}
function createBoxedNode(id, boxed) {
	return createSerovalNode(21, id, void 0, void 0, void 0, void 0, void 0, void 0, boxed);
}
var MAX_TYPED_ARRAY_LENGTH = 1e6;
function createViewNode(type, id, current, buffer) {
	const isDataView = type === 20;
	const size = isDataView ? current.byteLength : current.length;
	if (size > MAX_TYPED_ARRAY_LENGTH) throw new SerovalUnsupportedTypeError(current);
	return createSerovalNode(type, id, void 0, isDataView ? void 0 : getTypedArrayName(current), void 0, void 0, void 0, void 0, buffer, current.byteOffset, void 0, size);
}
function createErrorNode(type, id, current, options) {
	return createSerovalNode(type, id, getErrorConstructor(current), void 0, serializeString(current.message), options);
}
function createSetNode(id, items) {
	return createSerovalNode(7, id, void 0, void 0, void 0, void 0, void 0, items);
}
function createIteratorFactoryInstanceNode(type, factory, items) {
	return createSerovalNode(type, void 0, void 0, void 0, void 0, void 0, void 0, [factory, items]);
}
function createStreamConstructorNode(id, factory, sequence, live) {
	return createSerovalNode(31, id, void 0, void 0, void 0, void 0, void 0, sequence, factory, void 0, void 0, live);
}
function createStreamEventNode(type, id, parsed) {
	return createSerovalNode(type, id, void 0, void 0, void 0, void 0, void 0, void 0, parsed);
}
function createSequenceNode(id, sequence, throwAt, doneAt) {
	return createSerovalNode(35, id, throwAt, void 0, void 0, void 0, void 0, sequence, void 0, void 0, void 0, doneAt);
}
function isLiveStream(value) {
	return value instanceof LiveStream;
}
/**
* A single-consumer stream for incremental serialization. Unlike
* `createStream`, it keeps no history: at most one event is held, and the
* producer operation that sent it settles only when the consumer accepts it.
*
* An internal class rather than a tagged POJO: identity is checked with
* `instanceof`, which untrusted input cannot forge. The class is exported
* because bundlers cannot drop an unexported top-level class.
*/
var LiveStream = class {
	constructor(options) {
		this.consumed = false;
		this.closed = false;
		this.cancelled = false;
		this.options = options;
	}
	deliver(reader, record) {
		record.delivered = true;
		reader.resolve({
			event: record.event,
			accept: () => {
				if (this.pending === record && record.delivered) {
					const terminal = record.event.type !== "next";
					record.event = void 0;
					this.pending = void 0;
					const resolve = record.resolve;
					record.resolve = void 0;
					record.reject = void 0;
					if (terminal) {
						this.closed = true;
						this.options = void 0;
						const waiter = this.waiting;
						this.waiting = void 0;
						waiter?.reject(new SerovalLiveStreamError("closed"));
					}
					resolve?.();
				}
			}
		});
	}
	/** @internal */
	push(event) {
		if (this.cancelled) return Promise.reject(this.cancelReason);
		if (this.closed) return Promise.reject(new SerovalLiveStreamError("closed"));
		if (this.pending) return Promise.reject(new SerovalLiveStreamError("pending"));
		return new Promise((resolve, reject) => {
			const record = {
				event,
				delivered: false,
				resolve,
				reject
			};
			this.pending = record;
			if (this.waiting) {
				const waiter = this.waiting;
				this.waiting = void 0;
				this.deliver(waiter, record);
			}
		});
	}
	cancel(reason) {
		if (this.cancelled || this.closed) return;
		this.cancelled = true;
		this.cancelReason = reason;
		const record = this.pending;
		const waiter = this.waiting;
		this.pending = void 0;
		this.waiting = void 0;
		const callbackOwner = this.options;
		this.options = void 0;
		if (record) {
			record.event = void 0;
			const reject = record.reject;
			record.resolve = void 0;
			record.reject = void 0;
			reject?.(reason);
		}
		if (waiter) waiter.reject(reason);
		callbackOwner?.onCancel?.(reason);
	}
	read() {
		if (this.cancelled) return Promise.reject(this.cancelReason);
		if (this.closed) return Promise.reject(new SerovalLiveStreamError("closed"));
		if (this.waiting) return Promise.reject(new SerovalLiveStreamError("reading"));
		return new Promise((resolve, reject) => {
			const next = {
				resolve,
				reject
			};
			if (this.pending && !this.pending.delivered) this.deliver(next, this.pending);
			else this.waiting = next;
		});
	}
	consume() {
		if (this.consumed) throw new SerovalLiveStreamError("consumed");
		this.consumed = true;
		return {
			read: () => this.read(),
			cancel: (reason) => this.cancel(reason)
		};
	}
	/**
	* Consumes the stream through a replay-style listener, accepting each
	* event as soon as it has been delivered. Use `consume` or `pump` when
	* acceptance must wait for processing.
	*/
	on(listener) {
		const wrap = (key) => (value, accept) => {
			listener[key](value);
			accept();
		};
		return this.pump({
			next: wrap("next"),
			throw: wrap("throw"),
			return: wrap("return")
		});
	}
	/**
	* Consumes the stream into a sink that controls acceptance. Returns the
	* cancel function.
	* @internal
	*/
	pump(sink) {
		const consumer = this.consume();
		let current = sink;
		function next() {
			consumer.read().then((delivery) => {
				const target = current;
				if (!target) return;
				const event = delivery.event;
				let failure;
				let failed = false;
				try {
					failure = target[event.type](event.type === "throw" ? event.error : event.value, delivery.accept);
				} catch (error) {
					failed = true;
					failure = error;
				}
				if (failed || failure !== void 0) {
					current = void 0;
					try {
						consumer.cancel(failure);
					} finally {
						target.done?.();
					}
					return;
				}
				if (event.type === "next") {
					next();
					return;
				}
				current = void 0;
				target.done?.();
			}, (reason) => {
				const target = current;
				current = void 0;
				target?.error?.(reason);
			});
		}
		next();
		return consumer.cancel;
	}
};
/**
* An opaque reference allows hiding values from the serializer.
*/
var OpaqueReference = class {
	constructor(value, replacement) {
		this.value = value;
		this.replacement = replacement;
	}
};
var PROMISE_CONSTRUCTOR = () => {
	const resolver = {
		p: 0,
		s: 0,
		f: 0
	};
	resolver.p = new Promise((resolve, reject) => {
		resolver.s = resolve;
		resolver.f = reject;
	});
	return resolver;
};
var PROMISE_SUCCESS = (resolver, data) => {
	resolver.s(data);
	resolver.p.s = 1;
	resolver.p.v = data;
};
var PROMISE_FAILURE = (resolver, data) => {
	resolver.f(data);
	resolver.p.s = 2;
	resolver.p.v = data;
};
var SERIALIZED_PROMISE_CONSTRUCTOR = /* @__PURE__ */ PROMISE_CONSTRUCTOR.toString();
var SERIALIZED_PROMISE_SUCCESS = /* @__PURE__ */ PROMISE_SUCCESS.toString();
var SERIALIZED_PROMISE_FAILURE = /* @__PURE__ */ PROMISE_FAILURE.toString();
var STREAM_CONSTRUCTOR = (live) => {
	const buffer = [];
	const listeners = [];
	let alive = true;
	let success = false;
	let count = 0;
	const internal = {
		flush(value, mode, x) {
			live > 1 || buffer.push(value);
			for (x = 0; x < count; x++) {
				const listener = listeners[x];
				if (listener) listener[mode](value);
			}
		},
		up(listener, x, z, current) {
			for (x = 0, z = buffer.length; x < z; x++) {
				current = buffer[x];
				if (!alive && x === z - 1) listener[success ? "return" : "throw"](current);
				else listener.next(current);
			}
		},
		on(listener, temp = 0) {
			if (live > 1) throw new Error("Stream consumed");
			let subscribed = alive;
			if (alive) {
				for (temp = 0; temp < count; temp++) if (!listeners[temp]) break;
				if (temp === count) count++;
				listeners[temp] = listener;
			}
			internal.up(listener);
			if (live) {
				live = 2;
				buffer.length = 0;
			}
			return () => {
				if (alive && subscribed) {
					subscribed = false;
					listeners[temp] = void 0;
					while (count > 0 && !listeners[count - 1]) count--;
					listeners.length = count;
				}
			};
		}
	};
	return {
		__SEROVAL_STREAM__: true,
		on(listener) {
			return internal.on(listener);
		},
		next(value) {
			if (alive) internal.flush(value, "next");
		},
		throw(value) {
			if (alive) {
				internal.flush(value, "throw");
				alive = false;
				success = false;
				listeners.length = 0;
			}
		},
		return(value) {
			if (alive) {
				internal.flush(value, "return");
				alive = false;
				success = true;
				listeners.length = 0;
			}
		}
	};
};
var SERIALIZED_STREAM_CONSTRUCTOR = /* @__PURE__ */ STREAM_CONSTRUCTOR.toString();
var ITERATOR_CONSTRUCTOR = (symbol) => (sequence) => () => {
	let index = 0;
	const instance = {
		[symbol]() {
			return instance;
		},
		next() {
			if (index > sequence.d) return {
				done: true,
				value: void 0
			};
			const currentIndex = index++;
			const data = sequence.v[currentIndex];
			if (currentIndex === sequence.t) throw data;
			return {
				done: currentIndex === sequence.d,
				value: data
			};
		}
	};
	return instance;
};
var SERIALIZED_ITERATOR_CONSTRUCTOR = /* @__PURE__ */ ITERATOR_CONSTRUCTOR.toString();
var ASYNC_ITERATOR_CONSTRUCTOR = (symbol, createPromise) => (stream) => () => {
	let count = 0;
	let doneAt = -1;
	let isThrow = false;
	const buffer = [];
	const pending = [];
	const internal = { finalize(i = 0, len = pending.length) {
		for (; i < len; i++) pending[i].s({
			done: true,
			value: void 0
		});
	} };
	stream.on({
		next(value) {
			const temp = pending.shift();
			if (temp) temp.s({
				done: false,
				value
			});
			buffer.push(value);
		},
		throw(value) {
			const temp = pending.shift();
			if (temp) temp.f(value);
			internal.finalize();
			doneAt = buffer.length;
			isThrow = true;
			buffer.push(value);
		},
		return(value) {
			const temp = pending.shift();
			if (temp) temp.s({
				done: true,
				value
			});
			internal.finalize();
			doneAt = buffer.length;
			buffer.push(value);
		}
	});
	const instance = {
		[symbol]() {
			return instance;
		},
		next() {
			if (doneAt === -1) {
				const index = count++;
				if (index >= buffer.length) {
					const temp = createPromise();
					pending.push(temp);
					return temp.p;
				}
				return {
					done: false,
					value: buffer[index]
				};
			}
			if (count > doneAt) return {
				done: true,
				value: void 0
			};
			const index = count++;
			const value = buffer[index];
			if (index !== doneAt) return {
				done: false,
				value
			};
			if (isThrow) throw value;
			return {
				done: true,
				value
			};
		}
	};
	return instance;
};
var SERIALIZED_ASYNC_ITERATOR_CONSTRUCTOR = /* @__PURE__ */ ASYNC_ITERATOR_CONSTRUCTOR.toString();
var ARRAY_BUFFER_CONSTRUCTOR = (b64) => {
	const decoded = atob(b64);
	const length = decoded.length;
	const arr = new Uint8Array(length);
	for (let i = 0; i < length; i++) arr[i] = decoded.charCodeAt(i);
	return arr.buffer;
};
var SERIALIZED_ARRAY_BUFFER_CONSTRUCTOR = /* @__PURE__ */ ARRAY_BUFFER_CONSTRUCTOR.toString();
/**
* An internal class rather than a tagged POJO: identity is checked with
* `instanceof`, which untrusted input cannot forge. The class is exported
* because bundlers cannot drop an unexported top-level class.
* The eval-based `deserialize` path still rebuilds a `{__SEROVAL_SEQUENCE__…}`
* POJO from embedded source - it has no access to this class - so a value read
* back through `deserialize` is not an instance and, by design, is not treated
* as a genuine Sequence on re-serialization.
*/
var Sequence = class {
	constructor(values, throwAt, doneAt) {
		this.v = values;
		this.t = throwAt;
		this.d = doneAt;
	}
};
function isSequence(value) {
	return value instanceof Sequence;
}
function createSequence(values, throwAt, doneAt) {
	return new Sequence(values, throwAt, doneAt);
}
function createSequenceFromIterable(source) {
	const values = [];
	let throwsAt = -1;
	let doneAt = -1;
	const iterator = source[SYM_ITERATOR]();
	for (;;) try {
		const value = iterator.next();
		values.push(value.value);
		if (value.done) {
			doneAt = values.length - 1;
			break;
		}
	} catch (error) {
		throwsAt = values.length;
		doneAt = throwsAt;
		values.push(error);
		break;
	}
	return createSequence(values, throwsAt, doneAt);
}
var createIterator = /* @__PURE__ */ ITERATOR_CONSTRUCTOR(SYM_ITERATOR);
function sequenceToIterator(sequence) {
	return createIterator(sequence);
}
var ITERATOR = {};
var ASYNC_ITERATOR = {};
/**
* Placeholder references
*/
var SPECIAL_REFS = {
	[0]: {},
	[1]: {},
	[2]: {},
	[3]: {},
	[4]: {},
	[5]: {}
};
var SPECIAL_REF_STRING = {
	[0]: "[]",
	[1]: SERIALIZED_PROMISE_CONSTRUCTOR,
	[2]: SERIALIZED_PROMISE_SUCCESS,
	[3]: SERIALIZED_PROMISE_FAILURE,
	[4]: SERIALIZED_STREAM_CONSTRUCTOR,
	[5]: SERIALIZED_ARRAY_BUFFER_CONSTRUCTOR
};
/**
* An internal class rather than a tagged POJO: identity is checked with
* `instanceof`, which untrusted input cannot forge. The class is exported
* because bundlers cannot drop an unexported top-level class.
*
* The behavior is intentionally duplicated from `STREAM_CONSTRUCTOR`. That
* constructor's source is embedded verbatim into the eval-based `deserialize`
* output, which has no access to this class, so the two cannot be shared. A
* stream read back through `deserialize` is therefore a plain POJO and, by
* design, is not treated as a genuine Stream on re-serialization. Keep the two
* implementations in sync.
*/
var Stream = class {
	constructor(live) {
		this.buffer = [];
		this.listeners = [];
		this.alive = true;
		this.success = false;
		this.count = 0;
		this.live = live;
	}
	flush(value, mode) {
		this.live > 1 || this.buffer.push(value);
		for (let x = 0; x < this.count; x++) this.listeners[x]?.[mode](value);
	}
	replay(listener) {
		for (let x = 0, z = this.buffer.length; x < z; x++) {
			const current = this.buffer[x];
			if (!this.alive && x === z - 1) listener[this.success ? "return" : "throw"](current);
			else listener.next(current);
		}
	}
	on(listener) {
		if (this.live > 1) throw new Error("Stream consumed");
		let subscribed = this.alive;
		let temp = 0;
		if (subscribed) {
			for (; temp < this.count; temp++) if (!this.listeners[temp]) break;
			if (temp === this.count) this.count++;
			this.listeners[temp] = listener;
		}
		this.replay(listener);
		if (this.live) {
			this.live = 2;
			this.buffer.length = 0;
		}
		return () => {
			if (this.alive && subscribed) {
				subscribed = false;
				this.listeners[temp] = void 0;
				while (this.count > 0 && !this.listeners[this.count - 1]) this.count--;
				this.listeners.length = this.count;
			}
		};
	}
	/**
	* Returns the events of a stream that has ended, without subscribing, so a
	* live receiver is not consumed. The last value is the `return` or `throw`
	* value. Returns `undefined` while the stream is open, or when a live
	* receiver was already consumed and has no events left.
	* @internal
	*/
	endedEvents() {
		if (this.alive || this.live > 1) return void 0;
		return {
			values: this.buffer.slice(),
			success: this.success
		};
	}
	next(value) {
		if (this.alive) this.flush(value, "next");
	}
	throw(value) {
		if (this.alive) {
			this.flush(value, "throw");
			this.alive = false;
			this.success = false;
			this.listeners.length = 0;
		}
	}
	return(value) {
		if (this.alive) {
			this.flush(value, "return");
			this.alive = false;
			this.success = true;
			this.listeners.length = 0;
		}
	}
};
function isStream(value) {
	return value instanceof Stream || isLiveStream(value);
}
function createStream() {
	return new Stream();
}
var createAsyncIterable = /* @__PURE__ */ ASYNC_ITERATOR_CONSTRUCTOR(SYM_ASYNC_ITERATOR, PROMISE_CONSTRUCTOR);
function streamToAsyncIterable(stream) {
	return createAsyncIterable(stream);
}
async function promiseToResult(current) {
	try {
		return [1, await current];
	} catch (e) {
		return [0, e];
	}
}
function encodeArrayBuffer$1(current) {
	const bytes = new Uint8Array(current);
	if (typeof bytes.toBase64 === "function") return bytes.toBase64();
	let result = "";
	for (let i = 0, len = bytes.length; i < len; i++) result += String.fromCharCode(bytes[i]);
	return btoa(result);
}
var MIN_NATIVE_BASE64_LENGTH = 512;
function encodeArrayBuffer(current) {
	if (typeof Buffer !== "undefined") return Buffer.from(current).toString("base64");
	return encodeArrayBuffer$1(current);
}
function decodeArrayBuffer(source) {
	if (source.length < MIN_NATIVE_BASE64_LENGTH || typeof Buffer === "undefined") return ARRAY_BUFFER_CONSTRUCTOR(source);
	const decoded = atob(source);
	const buffer = new ArrayBuffer(decoded.length);
	Buffer.from(buffer).write(decoded, "latin1");
	return buffer;
}
function createPlugin(plugin) {
	return plugin;
}
function dedupePlugins(deduped, plugins) {
	for (let i = 0, len = plugins.length; i < len; i++) {
		const current = plugins[i];
		if (!deduped.has(current)) {
			deduped.add(current);
			if (current.extends) dedupePlugins(deduped, current.extends);
		}
	}
}
var RESOLVED_PLUGINS = /* @__PURE__ */ new WeakMap();
function matchResolved(resolved, plugins, added) {
	for (let i = 0, len = plugins.length; i < len; i++) {
		const current = plugins[i];
		if (current === resolved[added]) {
			added++;
			if (current.extends) {
				added = matchResolved(resolved, current.extends, added);
				if (added === -1) return -1;
			}
		} else {
			const index = resolved.indexOf(current);
			if (index === -1 || index >= added) return -1;
		}
	}
	return added;
}
function resolvePlugins(plugins) {
	if (plugins) {
		const cached = RESOLVED_PLUGINS.get(plugins);
		if (cached && matchResolved(cached, plugins, 0) === cached.length) return cached;
		const deduped = /* @__PURE__ */ new Set();
		dedupePlugins(deduped, plugins);
		const resolved = [...deduped];
		RESOLVED_PLUGINS.set(plugins, resolved);
		return resolved;
	}
}
/**
* Returns the plugins that are tested for plain objects. It is the same array
* when no plugin sets `skipPlainObjects`.
*/
function getPlainObjectPlugins(plugins) {
	if (plugins) {
		for (let i = 0, len = plugins.length; i < len; i++) if (plugins[i].skipPlainObjects) {
			const result = plugins.filter((plugin) => !plugin.skipPlainObjects);
			return result.length ? result : void 0;
		}
	}
	return plugins;
}
var REFERENCES_KEY = "__SEROVAL_REFS__";
var GLOBAL_CONTEXT_R = `self.\$R`;
function getCrossReferenceHeader(id) {
	if (id == null) return `${GLOBAL_CONTEXT_R}=${GLOBAL_CONTEXT_R}||[]`;
	return `(${GLOBAL_CONTEXT_R}=${GLOBAL_CONTEXT_R}||{})["${serializeString(id)}"]=[]`;
}
var REFERENCE = /* @__PURE__ */ new Map();
var INV_REFERENCE = /* @__PURE__ */ new Map();
function hasReference(id) {
	return INV_REFERENCE.has(id);
}
function getReferenceID(value) {
	return REFERENCE.get(value);
}
function getReference(id) {
	if (hasReference(id)) return INV_REFERENCE.get(id);
	throw new SerovalMissingReferenceForIdError(id);
}
function createBaseParserContext(options) {
	return {
		plugins: options.plugins,
		plainObjectPlugins: getPlainObjectPlugins(options.plugins),
		marked: /* @__PURE__ */ new Set(),
		features: 127 ^ (options.disabledFeatures ?? 0),
		refs: options.refs ?? /* @__PURE__ */ new Map(),
		depthLimit: options.depthLimit || 1e3,
		compactArrayBufferViews: options.compactArrayBufferViews ?? false
	};
}
/**
* Returns the plugins to test for an object. Plain objects, whose prototype is
* `Object.prototype`, skip the plugins that set `skipPlainObjects`. Checking
* the prototype as well as `constructor` keeps instances whose prototype has
* no own `constructor` property from skipping those plugins.
*/
function getObjectPlugins(ctx, current, currentClass) {
	return currentClass === Object && Object.getPrototypeOf(current) === Object.prototype ? ctx.plainObjectPlugins : ctx.plugins;
}
/**
* Ensures that the value (based on an identifier) has been visited by the parser.
* @param ctx
* @param id
*/
function markParserRef(ctx, id) {
	ctx.marked.add(id);
}
/**
* Creates an identifier for a value
* @param ctx
* @param current
*/
function createIndexForValue(ctx, current) {
	const id = ctx.refs.size;
	ctx.refs.set(current, id);
	return id;
}
function getNodeForIndexedValue(ctx, current) {
	const registeredId = ctx.refs.get(current);
	if (registeredId != null) {
		markParserRef(ctx, registeredId);
		return createIndexedValueNode(registeredId);
	}
	return createIndexForValue(ctx, current);
}
function getReferenceNode(ctx, current) {
	const indexed = getNodeForIndexedValue(ctx, current);
	if (typeof indexed !== "number") return indexed;
	const referenceId = getReferenceID(current);
	return referenceId === void 0 ? indexed : createReferenceNode(indexed, referenceId);
}
/**
* Parsing methods
*/
function parseWellKnownSymbol(ctx, current) {
	const ref = getReferenceNode(ctx, current);
	if (typeof ref !== "number") return ref;
	if (current in INV_SYMBOL_REF) return createWKSymbolNode(ref, current);
	throw new SerovalUnsupportedTypeError(current);
}
function parseSpecialReference(ctx, ref) {
	const result = getNodeForIndexedValue(ctx, SPECIAL_REFS[ref]);
	if (typeof result !== "number") return result;
	return createSerovalNode(26, result, ref);
}
function parseIteratorFactory(ctx) {
	const result = getNodeForIndexedValue(ctx, ITERATOR);
	if (typeof result !== "number") return result;
	return createSerovalNode(27, result, void 0, void 0, void 0, void 0, void 0, void 0, parseWellKnownSymbol(ctx, SYM_ITERATOR));
}
function parseAsyncIteratorFactory(ctx) {
	const result = getNodeForIndexedValue(ctx, ASYNC_ITERATOR);
	if (typeof result !== "number") return result;
	return createSerovalNode(29, result, void 0, void 0, void 0, void 0, void 0, [parseSpecialReference(ctx, 1), parseWellKnownSymbol(ctx, SYM_ASYNC_ITERATOR)]);
}
function getTemporalType(currentClass) {
	switch (currentClass) {
		case Temporal.Instant: return 0;
		case Temporal.Duration: return 1;
		case Temporal.PlainDate: return 2;
		case Temporal.PlainDateTime: return 3;
		case Temporal.PlainMonthDay: return 4;
		case Temporal.PlainTime: return 5;
		case Temporal.PlainYearMonth: return 6;
		case Temporal.ZonedDateTime: return 7;
		default: return;
	}
}
function getObjectClass(current) {
	const currentClass = current.constructor;
	if (currentClass !== void 0 && typeof currentClass !== "function") {
		const proto = Object.getPrototypeOf(current);
		return proto === null ? void 0 : proto.constructor;
	}
	return currentClass;
}
/**
* Decides how an object is parsed. Shared by the sync, stream and async
* parsers so the class checks and feature gates live in one place.
*/
function getObjectKind(current, currentClass, features) {
	switch (currentClass) {
		case Object: return 1;
		case void 0: return 2;
		case Date: return 3;
		case Error:
		case EvalError:
		case RangeError:
		case ReferenceError:
		case SyntaxError:
		case TypeError:
		case URIError: return 4;
		case Number:
		case Boolean:
		case String:
		case BigInt: return 6;
		case ArrayBuffer: return 7;
		case Int8Array:
		case Int16Array:
		case Int32Array:
		case Uint8Array:
		case Uint16Array:
		case Uint32Array:
		case Uint8ClampedArray:
		case Float32Array:
		case Float64Array: return 8;
		case DataView: return 10;
		case Map: return 11;
		case Set: return 12;
	}
	if (currentClass === Promise || current instanceof Promise) return 13;
	if (features & 32 && currentClass === RegExp) return 14;
	if (features & 16 && (currentClass === BigInt64Array || currentClass === BigUint64Array)) return 9;
	if (features & 1 && typeof AggregateError !== "undefined" && (currentClass === AggregateError || current instanceof AggregateError)) return 5;
	if (features & 64 && typeof Temporal !== "undefined" && getTemporalType(currentClass) != null) return 15;
	if (current instanceof Error) return 4;
	if (SYM_ITERATOR in current || SYM_ASYNC_ITERATOR in current) return 16;
	return 0;
}
function createObjectNode(id, current, empty, record) {
	return createSerovalNode(empty ? 11 : 10, id, void 0, void 0, void 0, record, void 0, void 0, void 0, void 0, getObjectFlag(current));
}
/**
* Gets the sentinel node for a Map. Call it before parsing the entries, so
* that an outer Map declares the sentinel before any Map inside it uses it.
*/
function parseMapSentinel(ctx) {
	return parseSpecialReference(ctx, 0);
}
function createMapNode(id, sentinel, k, v) {
	return createSerovalNode(8, id, void 0, void 0, void 0, void 0, {
		k,
		v
	}, void 0, sentinel);
}
function createPromiseConstructorNode(ctx, id, resolver) {
	return createSerovalNode(22, id, resolver, void 0, void 0, void 0, void 0, void 0, parseSpecialReference(ctx, 1));
}
function getArrayBufferView(ctx, current) {
	if (!ctx.compactArrayBufferViews) return current;
	const buffer = new Uint8Array(current.buffer, current.byteOffset, current.byteLength).slice().buffer;
	return new (current instanceof DataView ? DataView : getTypedArrayConstructor(getTypedArrayName(current)))(buffer);
}
function createArrayBufferNode(ctx, id, current) {
	return createSerovalNode(19, id, encodeArrayBuffer(current), void 0, void 0, void 0, void 0, void 0, parseSpecialReference(ctx, 5));
}
function createAsyncParserContext(options) {
	return { base: createBaseParserContext(options) };
}
async function parseItems$1(ctx, depth, current) {
	const len = current.length;
	const nodes = new Array(len);
	for (let i = 0, node; i < len; i++) if (i in current) {
		node = parseValueAsync(ctx, depth, current[i]);
		nodes[i] = node instanceof Promise ? await node : node;
	} else nodes[i] = 0;
	return nodes;
}
async function parseArray$1(ctx, depth, id, current) {
	return createArrayNode(id, current, await parseItems$1(ctx, depth, current));
}
async function parseProperties$1(ctx, depth, properties) {
	const keys = Object.keys(properties);
	const len = keys.length;
	const keyNodes = new Array(len);
	const valueNodes = new Array(len);
	for (let i = 0, key, node; i < len; i++) {
		key = keys[i];
		keyNodes[i] = serializeString(key);
		node = parseValueAsync(ctx, depth, properties[key]);
		valueNodes[i] = node instanceof Promise ? await node : node;
	}
	if (SYM_ITERATOR in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_ITERATOR));
		valueNodes.push(createIteratorFactoryInstanceNode(28, parseIteratorFactory(ctx.base), await parseAsync(ctx, depth, createSequenceFromIterable(properties))));
	}
	if (SYM_ASYNC_ITERATOR in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_ASYNC_ITERATOR));
		valueNodes.push(createIteratorFactoryInstanceNode(30, parseAsyncIteratorFactory(ctx.base), await parseAsyncIterable$1(ctx, depth, properties)));
	}
	if (SYM_TO_STRING_TAG in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_TO_STRING_TAG));
		valueNodes.push(createStringNode(properties[SYM_TO_STRING_TAG]));
	}
	if (SYM_IS_CONCAT_SPREADABLE in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_IS_CONCAT_SPREADABLE));
		valueNodes.push(properties[SYM_IS_CONCAT_SPREADABLE] ? TRUE_NODE : FALSE_NODE);
	}
	return {
		k: keyNodes,
		v: valueNodes
	};
}
async function parsePlainObject$1(ctx, depth, id, current, empty) {
	return createObjectNode(id, current, empty, await parseProperties$1(ctx, depth, current));
}
async function parseBoxed$1(ctx, depth, id, current) {
	return createBoxedNode(id, await parseAsync(ctx, depth, current.valueOf()));
}
async function parseView$1(ctx, depth, type, id, current) {
	current = getArrayBufferView(ctx.base, current);
	return createViewNode(type, id, current, await parseAsync(ctx, depth, current.buffer));
}
async function parseError$1(ctx, depth, type, id, current) {
	const options = getErrorOptions(current, ctx.base.features);
	return createErrorNode(type, id, current, options ? await parseProperties$1(ctx, depth, options) : void 0);
}
async function parseMap$1(ctx, depth, id, current) {
	const sentinel = parseMapSentinel(ctx.base);
	const keyNodes = new Array(current.size);
	const valueNodes = new Array(current.size);
	let node;
	let i = 0;
	for (const [key, value] of current.entries()) {
		node = parseValueAsync(ctx, depth, key);
		keyNodes[i] = node instanceof Promise ? await node : node;
		node = parseValueAsync(ctx, depth, value);
		valueNodes[i] = node instanceof Promise ? await node : node;
		i++;
	}
	return createMapNode(id, sentinel, keyNodes, valueNodes);
}
async function parseSet$1(ctx, depth, id, current) {
	const items = new Array(current.size);
	let node;
	let i = 0;
	for (const item of current.keys()) {
		node = parseValueAsync(ctx, depth, item);
		items[i++] = node instanceof Promise ? await node : node;
	}
	return createSetNode(id, items);
}
async function parsePlugin$1(ctx, depth, id, current, currentPlugins) {
	if (currentPlugins) for (let i = 0, len = currentPlugins.length; i < len; i++) {
		const plugin = currentPlugins[i];
		if (plugin.parse.async && plugin.test(current)) return createPluginNode(id, plugin.tag, await plugin.parse.async(current, {
			parse: (value) => parseAsync(ctx, depth, value),
			parseStreamSource(source) {
				if (depth >= ctx.base.depthLimit) throw new SerovalDepthLimitError(ctx.base.depthLimit);
				return parseAsyncIterable$1(ctx, depth + 1, source);
			}
		}, { id }));
	}
}
async function parsePromise$1(ctx, depth, id, current) {
	const [status, result] = await promiseToResult(current);
	return createSerovalNode(12, id, status, void 0, void 0, void 0, void 0, void 0, await parseAsync(ctx, depth, result));
}
function parseStreamHandle(depth, id, current, resolve, reject) {
	const sequence = [];
	let unparsed = 0;
	let ended = false;
	let settled = false;
	const fail = (error) => {
		if (!settled) {
			settled = true;
			try {
				cleanup(error);
			} catch {}
			reject(error);
		}
	};
	const handle = (type) => (value, accept) => {
		if (settled) return;
		markParserRef(this.base, id);
		const slot = sequence.push(void 0) - 1;
		unparsed++;
		if (type !== 32) ended = true;
		parseAsync(this, depth, value).then((data) => {
			if (!settled) {
				sequence[slot] = createStreamEventNode(type, id, data);
				unparsed--;
				accept?.();
				if (ended && unparsed === 0) {
					settled = true;
					try {
						cleanup();
					} catch (error) {
						reject(error);
						return;
					}
					resolve(sequence);
				}
			}
		}, fail);
	};
	const listener = {
		next: handle(32),
		throw: handle(33),
		return: handle(34)
	};
	const cleanup = isLiveStream(current) ? current.pump(listener) : current.on(listener);
}
async function parseStream$1(ctx, depth, id, current) {
	return createStreamConstructorNode(id, parseSpecialReference(ctx.base, 4), await new Promise(parseStreamHandle.bind(ctx, depth, id, current)));
}
/**
* Collects an async iterable into a replay node, one value at a time.
*/
async function parseAsyncIterable$1(ctx, depth, current) {
	const id = createIndexForValue(ctx.base, {});
	const reference = parseSpecialReference(ctx.base, 4);
	const iterator = current[SYM_ASYNC_ITERATOR]();
	const sequence = [];
	for (;;) {
		let result;
		try {
			result = await iterator.next();
		} catch (error) {
			markParserRef(ctx.base, id);
			sequence.push(createStreamEventNode(33, id, await parseAsync(ctx, depth, error)));
			break;
		}
		markParserRef(ctx.base, id);
		let parsed;
		try {
			parsed = await parseAsync(ctx, depth, result.value);
		} catch (error) {
			Promise.resolve().then(() => iterator.return?.()).catch(() => {});
			throw error;
		}
		sequence.push(createStreamEventNode(result.done ? 34 : 32, id, parsed));
		if (result.done) break;
	}
	return createStreamConstructorNode(id, reference, sequence);
}
async function parseSequence$1(ctx, depth, id, current) {
	const len = current.v.length;
	const nodes = new Array(len);
	for (let i = 0, node; i < len; i++) {
		node = parseValueAsync(ctx, depth, current.v[i]);
		nodes[i] = node instanceof Promise ? await node : node;
	}
	return createSequenceNode(id, nodes, current.t, current.d);
}
async function parseObjectAsync(ctx, depth, id, current) {
	if (Array.isArray(current)) return parseArray$1(ctx, depth, id, current);
	if (isStream(current)) return parseStream$1(ctx, depth, id, current);
	if (isSequence(current)) return parseSequence$1(ctx, depth, id, current);
	const currentClass = getObjectClass(current);
	if (currentClass === OpaqueReference) return parseAsync(ctx, depth, current.replacement);
	const parsed = await parsePlugin$1(ctx, depth, id, current, getObjectPlugins(ctx.base, current, currentClass));
	if (parsed) return parsed;
	if (currentClass === Object) return parsePlainObject$1(ctx, depth, id, current, false);
	switch (getObjectKind(current, currentClass, ctx.base.features)) {
		case 2: return parsePlainObject$1(ctx, depth, id, current, true);
		case 3: return createDateNode(id, current);
		case 4: return parseError$1(ctx, depth, 13, id, current);
		case 5: return parseError$1(ctx, depth, 14, id, current);
		case 6: return parseBoxed$1(ctx, depth, id, current);
		case 7: return createArrayBufferNode(ctx.base, id, current);
		case 8: return parseView$1(ctx, depth, 15, id, current);
		case 9: return parseView$1(ctx, depth, 16, id, current);
		case 10: return parseView$1(ctx, depth, 20, id, current);
		case 11: return parseMap$1(ctx, depth, id, current);
		case 12: return parseSet$1(ctx, depth, id, current);
		case 13: return parsePromise$1(ctx, depth, id, current);
		case 14: return createRegExpNode(id, current);
		case 15: return createTemporalNode(id, getTemporalType(currentClass), current);
		case 16: return parsePlainObject$1(ctx, depth, id, current, !!currentClass);
		default: throw new SerovalUnsupportedTypeError(current);
	}
}
async function parseFunctionAsync(ctx, depth, current) {
	const ref = getReferenceNode(ctx.base, current);
	if (typeof ref !== "number") return ref;
	const plugin = await parsePlugin$1(ctx, depth, ref, current, ctx.base.plugins);
	if (plugin) return plugin;
	throw new SerovalUnsupportedTypeError(current);
}
/**
* Parses primitives and already-seen values synchronously; only objects and
* functions come back as a Promise. Errors are thrown synchronously, which
* an async caller turns into a rejection as before.
*/
function parseValueAsync(ctx, depth, current) {
	if (depth >= ctx.base.depthLimit) throw new SerovalDepthLimitError(ctx.base.depthLimit);
	switch (typeof current) {
		case "boolean": return current ? TRUE_NODE : FALSE_NODE;
		case "undefined": return UNDEFINED_NODE;
		case "string": return createStringNode(current);
		case "number": return createNumberNode(current);
		case "bigint": return createBigIntNode(current);
		case "object":
			if (current) {
				const ref = getReferenceNode(ctx.base, current);
				return typeof ref === "number" ? parseObjectAsync(ctx, depth + 1, ref, current) : ref;
			}
			return NULL_NODE;
		case "symbol": return parseWellKnownSymbol(ctx.base, current);
		case "function": return parseFunctionAsync(ctx, depth, current);
		default: throw new SerovalUnsupportedTypeError(current);
	}
}
async function parseAsync(ctx, depth, current) {
	return await parseValueAsync(ctx, depth, current);
}
async function parseTopAsync(ctx, current) {
	try {
		return await parseAsync(ctx, 0, current);
	} catch (error) {
		throw error instanceof SerovalParserError ? error : new SerovalParserError(error);
	}
}
function isValidKey(key) {
	switch (key) {
		case "constructor":
		case "__proto__":
		case "prototype":
		case "__defineGetter__":
		case "__defineSetter__":
		case "__lookupGetter__":
		case "__lookupSetter__": return false;
		default: return true;
	}
}
function isValidSymbol(symbol) {
	switch (symbol) {
		case SYM_ASYNC_ITERATOR:
		case SYM_IS_CONCAT_SPREADABLE:
		case SYM_TO_STRING_TAG:
		case SYM_ITERATOR: return true;
		default: return false;
	}
}
var DEFAULT_MAX_BASE64_LENGTH = 1e6;
var MAX_BIGINT_LENGTH = 1e4;
var MAX_REGEXP_SOURCE_LENGTH = 2e4;
function applyObjectFlag(obj, flag) {
	switch (flag) {
		case 3: return Object.freeze(obj);
		case 1: return Object.preventExtensions(obj);
		case 2: return Object.seal(obj);
		default: return obj;
	}
}
var DEFAULT_DEPTH_LIMIT = 1e3;
function createBaseDeserializerContext(options) {
	const maxBase64Length = options.maxBase64Length ?? DEFAULT_MAX_BASE64_LENGTH;
	if (!Number.isSafeInteger(maxBase64Length) || maxBase64Length < 0) throw new RangeError("maxBase64Length must be a non-negative safe integer");
	const refs = options.refs ?? /* @__PURE__ */ new Map();
	if (!("types" in refs)) Object.assign(refs, { types: /* @__PURE__ */ new Map() });
	return {
		plugins: options.plugins,
		refs,
		features: options.features ?? 127 ^ (options.disabledFeatures ?? 0),
		depthLimit: options.depthLimit || DEFAULT_DEPTH_LIMIT,
		maxBase64Length
	};
}
function createVanillaDeserializerContext(options) {
	return {
		base: createBaseDeserializerContext(options),
		marked: new Set(options.markedRefs)
	};
}
function guardIndexedValue(ctx, id) {
	const node = {
		t: 4,
		i: id
	};
	if (id < 0 || !Number.isInteger(id)) throw new SerovalMalformedNodeError(node);
	if (ctx.refs.has(id)) throw new SerovalConflictedNodeIdError(node);
}
function isThennable(value) {
	return !!value && (typeof value === "object" || typeof value === "function") && "then" in value && typeof value.then === "function";
}
var ignoreRejection = () => {};
function assignIndexedValue$1(ctx, id, value) {
	guardIndexedValue(ctx.base, id);
	if (value instanceof Promise) value.catch(ignoreRejection);
	const marked = ctx.marked;
	if (!marked || marked.has(id)) ctx.base.refs.set(id, value);
	return value;
}
function deserializeKnownValue(node, record, key) {
	if (Object.hasOwn(record, key)) return record[key];
	throw new SerovalMalformedNodeError(node);
}
function deserializeReference(ctx, node) {
	return assignIndexedValue$1(ctx, node.i, getReference(deserializeString(node.s)));
}
function validateNodeList(node, list) {
	if (!Array.isArray(list)) throw new SerovalMalformedNodeError(node);
}
function deserializeArray(ctx, depth, node) {
	const items = node.a;
	validateNodeList(node, items);
	const len = items.length;
	const result = assignIndexedValue$1(ctx, node.i, new Array(len));
	for (let i = 0, item; i < len; i++) {
		item = items[i];
		if (item) result[i] = deserialize$1(ctx, depth, item);
	}
	applyObjectFlag(result, node.o);
	return result;
}
function assignStringProperty(object, key, value) {
	if (isValidKey(key)) object[key] = value;
	else Object.defineProperty(object, key, {
		value,
		configurable: true,
		enumerable: true,
		writable: true
	});
}
function assignProperty(ctx, depth, object, key, value) {
	if (typeof key === "string") assignStringProperty(object, deserializeString(key), deserialize$1(ctx, depth, value));
	else {
		const actual = deserialize$1(ctx, depth, key);
		switch (typeof actual) {
			case "string":
				assignStringProperty(object, actual, deserialize$1(ctx, depth, value));
				break;
			case "symbol":
				if (isValidSymbol(actual)) object[actual] = deserialize$1(ctx, depth, value);
				break;
			default: throw new SerovalMalformedNodeError(key);
		}
	}
}
function assignNodeType(ctx, id, type) {
	ctx.base.refs.types.set(id, type);
}
function validateNodeType(ctx, node, id, type) {
	if (ctx.base.refs.types.get(id) !== type) throw new SerovalMalformedNodeError(node);
}
function deserializeProperties(ctx, depth, node, result) {
	const keys = node.k;
	validateNodeList(node, keys);
	validateNodeList(node, node.v);
	const len = keys.length;
	if (len > 0) for (let i = 0, vals = node.v; i < len; i++) assignProperty(ctx, depth, result, keys[i], vals[i]);
	return result;
}
function deserializeObject(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, node.t === 10 ? {} : Object.create(null));
	deserializeProperties(ctx, depth, node.p, result);
	applyObjectFlag(result, node.o);
	return result;
}
function deserializeDate(ctx, node) {
	return assignIndexedValue$1(ctx, node.i, new Date(node.s));
}
function deserializeTemporal(ctx, node) {
	if (!(ctx.base.features & 64)) throw new SerovalUnsupportedNodeError(node);
	const construct = Temporal[deserializeKnownValue(node, TEMPORAL_TYPE_NAME, node.c)];
	return assignIndexedValue$1(ctx, node.i, construct.from(node.s));
}
function deserializeRegExp(ctx, node) {
	if (ctx.base.features & 32) {
		const source = deserializeString(node.c);
		if (source.length > MAX_REGEXP_SOURCE_LENGTH) throw new SerovalMalformedNodeError(node);
		return assignIndexedValue$1(ctx, node.i, new RegExp(source, node.m));
	}
	throw new SerovalUnsupportedNodeError(node);
}
function deserializeSet(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, /* @__PURE__ */ new Set());
	validateNodeList(node, node.a);
	for (let i = 0, items = node.a, len = items.length; i < len; i++) result.add(deserialize$1(ctx, depth, items[i]));
	return result;
}
function deserializeMap(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, /* @__PURE__ */ new Map());
	validateNodeList(node, node.e.k);
	validateNodeList(node, node.e.v);
	for (let i = 0, keys = node.e.k, vals = node.e.v, len = keys.length; i < len; i++) result.set(deserialize$1(ctx, depth, keys[i]), deserialize$1(ctx, depth, vals[i]));
	return result;
}
function deserializeArrayBuffer(ctx, node) {
	if (typeof node.s !== "string") throw new SerovalMalformedNodeError(node);
	if (node.s.length > ctx.base.maxBase64Length) throw new RangeError("ArrayBuffer exceeds maxBase64Length (" + ctx.base.maxBase64Length + ")");
	const buffer = decodeArrayBuffer(deserializeString(node.s));
	return assignIndexedValue$1(ctx, node.i, buffer);
}
function deserializeView(ctx, depth, node, construct) {
	const source = deserialize$1(ctx, depth, node.f);
	if (!(source instanceof ArrayBuffer)) throw new SerovalMalformedNodeError(node);
	const offset = node.b ?? 0;
	if (offset < 0 || offset > source.byteLength) throw new SerovalMalformedNodeError(node);
	return assignIndexedValue$1(ctx, node.i, construct ? new construct(source, offset, node.l) : new DataView(source, offset, node.l));
}
function deserializeDictionary(ctx, depth, node, result) {
	if (node.p) {
		const fields = deserializeProperties(ctx, depth, node.p, {});
		Object.defineProperties(result, Object.getOwnPropertyDescriptors(fields));
	}
	return result;
}
function deserializeAggregateError(ctx, depth, node) {
	return deserializeDictionary(ctx, depth, node, assignIndexedValue$1(ctx, node.i, new AggregateError([], deserializeString(node.m))));
}
function deserializeError(ctx, depth, node) {
	const construct = deserializeKnownValue(node, ERROR_CONSTRUCTOR, node.s);
	return deserializeDictionary(ctx, depth, node, assignIndexedValue$1(ctx, node.i, new construct(deserializeString(node.m))));
}
function deserializePromise(ctx, depth, node) {
	const deferred = PROMISE_CONSTRUCTOR();
	const result = assignIndexedValue$1(ctx, node.i, deferred.p);
	const deserialized = deserialize$1(ctx, depth, node.f);
	if (isThennable(deserialized)) throw new SerovalMalformedNodeError(node.f);
	if (node.s) deferred.s(deserialized);
	else deferred.f(deserialized);
	return result;
}
function deserializeBoxed(ctx, depth, node) {
	return assignIndexedValue$1(ctx, node.i, Object(deserialize$1(ctx, depth, node.f)));
}
function deserializePlugin(ctx, depth, node) {
	const currentPlugins = ctx.base.plugins;
	if (currentPlugins) {
		const tag = deserializeString(node.c);
		for (let i = 0, len = currentPlugins.length; i < len; i++) {
			const plugin = currentPlugins[i];
			if (plugin.tag === tag) return assignIndexedValue$1(ctx, node.i, plugin.deserialize(node.s, { deserialize: (current) => deserialize$1(ctx, depth, current) }, { id: node.i }));
		}
	}
	throw new SerovalMissingPluginError(node.c);
}
function deserializePromiseConstructor(ctx, node) {
	const value = assignIndexedValue$1(ctx, node.i, assignIndexedValue$1(ctx, node.s, PROMISE_CONSTRUCTOR()).p);
	assignNodeType(ctx, node.s, 22);
	ctx.base.pending?.add(node.s);
	return value;
}
function deserializePromiseFulfill(ctx, depth, node) {
	const deferred = ctx.base.refs.get(node.i);
	if (deferred) {
		validateNodeType(ctx, node, node.i, 22);
		const deserialized = deserialize$1(ctx, depth, node.a[1]);
		if (isThennable(deserialized)) throw new SerovalMalformedNodeError(node.a[1]);
		if (node.t === 23) deferred.s(deserialized);
		else deferred.f(deserialized);
		ctx.base.pending?.delete(node.i);
		return;
	}
	throw new SerovalMissingInstanceError("Promise");
}
function deserializeIteratorFactoryInstance(ctx, depth, node) {
	deserialize$1(ctx, depth, node.a[0]);
	const source = deserialize$1(ctx, depth, node.a[1]);
	if (!isSequence(source)) throw new SerovalMalformedNodeError(node.a[1]);
	return sequenceToIterator(source);
}
function deserializeAsyncIteratorFactoryInstance(ctx, depth, node) {
	deserialize$1(ctx, depth, node.a[0]);
	const source = deserialize$1(ctx, depth, node.a[1]);
	if (!isStream(source)) throw new SerovalMalformedNodeError(node.a[1]);
	return streamToAsyncIterable(source);
}
function deserializeStreamConstructor(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, new Stream(node.l === 1 ? 1 : void 0));
	assignNodeType(ctx, node.i, 31);
	ctx.base.pending?.add(node.i);
	const items = node.a;
	validateNodeList(node, items);
	const len = items.length;
	if (len) for (let i = 0; i < len; i++) deserialize$1(ctx, depth, items[i]);
	return result;
}
function deserializeStreamCall(ctx, depth, node, method) {
	const deferred = ctx.base.refs.get(node.i);
	if (deferred) {
		validateNodeType(ctx, node, node.i, 31);
		deferred[method](deserialize$1(ctx, depth, node.f));
		if (method !== "next") ctx.base.pending?.delete(node.i);
		return;
	}
	throw new SerovalMissingInstanceError("Stream");
}
function deserializeIteratorFactory(ctx, depth, node) {
	deserialize$1(ctx, depth, node.f);
}
function deserializeAsyncIteratorFactory(ctx, depth, node) {
	deserialize$1(ctx, depth, node.a[1]);
}
function isSequenceIndex(value, size) {
	return Number.isInteger(value) && value >= -1 && value < size;
}
function deserializeSequence(ctx, depth, node) {
	validateNodeList(node, node.a);
	const size = node.a.length;
	if (!(isSequenceIndex(node.s, size) && isSequenceIndex(node.l, size))) throw new SerovalMalformedNodeError(node);
	const result = assignIndexedValue$1(ctx, node.i, createSequence([], node.s, node.l));
	assignNodeType(ctx, node.i, 35);
	for (let i = 0; i < size; i++) result.v[i] = deserialize$1(ctx, depth, node.a[i]);
	return result;
}
function deserialize$1(ctx, depth, node) {
	if (depth > ctx.base.depthLimit) throw new SerovalDepthLimitError(ctx.base.depthLimit);
	depth += 1;
	switch (node.t) {
		case 2: return deserializeKnownValue(node, CONSTANT_VAL, node.s);
		case 0: return Number(node.s);
		case 1: return deserializeString(String(node.s));
		case 3:
			if (String(node.s).length > MAX_BIGINT_LENGTH) throw new SerovalMalformedNodeError(node);
			return BigInt(node.s);
		case 4: return ctx.base.refs.get(node.i);
		case 18: return deserializeReference(ctx, node);
		case 9: return deserializeArray(ctx, depth, node);
		case 10:
		case 11: return deserializeObject(ctx, depth, node);
		case 5: return deserializeDate(ctx, node);
		case 6: return deserializeRegExp(ctx, node);
		case 7: return deserializeSet(ctx, depth, node);
		case 8: return deserializeMap(ctx, depth, node);
		case 19: return deserializeArrayBuffer(ctx, node);
		case 16:
		case 15: return deserializeView(ctx, depth, node, getTypedArrayConstructor(node.c));
		case 20: return deserializeView(ctx, depth, node);
		case 14: return deserializeAggregateError(ctx, depth, node);
		case 13: return deserializeError(ctx, depth, node);
		case 12: return deserializePromise(ctx, depth, node);
		case 17: return deserializeKnownValue(node, SYMBOL_REF, node.s);
		case 21: return deserializeBoxed(ctx, depth, node);
		case 25: return deserializePlugin(ctx, depth, node);
		case 22: return deserializePromiseConstructor(ctx, node);
		case 23:
		case 24: return deserializePromiseFulfill(ctx, depth, node);
		case 28: return deserializeIteratorFactoryInstance(ctx, depth, node);
		case 30: return deserializeAsyncIteratorFactoryInstance(ctx, depth, node);
		case 31: return deserializeStreamConstructor(ctx, depth, node);
		case 32: return deserializeStreamCall(ctx, depth, node, "next");
		case 33: return deserializeStreamCall(ctx, depth, node, "throw");
		case 34: return deserializeStreamCall(ctx, depth, node, "return");
		case 27: return deserializeIteratorFactory(ctx, depth, node);
		case 29: return deserializeAsyncIteratorFactory(ctx, depth, node);
		case 35: return deserializeSequence(ctx, depth, node);
		case 36: return deserializeTemporal(ctx, node);
		default: throw new SerovalUnsupportedNodeError(node);
	}
}
function deserializeTop(ctx, node) {
	try {
		return deserialize$1(ctx, 0, node);
	} catch (error) {
		throw new SerovalDeserializationError(error);
	}
}
var RETURN = () => T;
var IS_MODERN = /* @__PURE__ */ (/* @__PURE__ */ RETURN.toString()).includes("=>");
function createFunction(parameters, body) {
	if (IS_MODERN) return (parameters.length === 1 ? parameters[0] : "(" + parameters.join(",") + ")") + "=>" + (body.startsWith("{") ? "(" + body + ")" : body);
	return "function(" + parameters.join(",") + "){return " + body + "}";
}
function createEffectfulFunction(parameters, body) {
	if (IS_MODERN) return (parameters.length === 1 ? parameters[0] : "(" + parameters.join(",") + ")") + "=>{" + body + "}";
	return "function(" + parameters.join(",") + "){" + body + "}";
}
var REF_START_CHARS = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_";
var REF_START_CHARS_LEN = 34;
var REF_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_";
var REF_CHARS_LEN = 64;
function getIdentifier(index) {
	let mod = index % REF_START_CHARS_LEN;
	let ref = REF_START_CHARS[mod];
	index = (index - mod) / REF_START_CHARS_LEN;
	while (index > 0) {
		mod = index % REF_CHARS_LEN;
		ref += REF_CHARS[mod];
		index = (index - mod) / REF_CHARS_LEN;
	}
	return ref;
}
function isValidIdentifier(name) {
	const len = name.length;
	for (let i = 0; i < len; i++) {
		const code = name.charCodeAt(i);
		if (!(code >= 97 && code <= 122 || code >= 65 && code <= 90 || code >= 48 && code <= 57 && i > 0 || code === 95 || code === 36)) return false;
	}
	return len > 0;
}
function getAssignmentExpression(assignment) {
	switch (assignment.t) {
		case 0: return assignment.s + "=" + assignment.v;
		case 2: return assignment.s + ".set(" + assignment.k + "," + assignment.v + ")";
		case 1: return assignment.s + ".add(" + assignment.v + ")";
		case 3: return assignment.s + ".delete(" + assignment.k + ")";
		case 4: return "Object.defineProperty(" + assignment.s + ",\"__proto__\",{value:" + assignment.k + ",configurable:!0,enumerable:!0,writable:!0})";
	}
}
var MAX_ASSIGNMENT_CHAIN_LENGTH = 100;
function resolveAssignments(assignments) {
	if (!assignments.length) return void 0;
	let previous = assignments[0];
	let expression = getAssignmentExpression(previous);
	let result = "";
	let chainLength = 1;
	for (let index = 1, length = assignments.length; index < length; index++) {
		const assignment = assignments[index];
		if (chainLength === MAX_ASSIGNMENT_CHAIN_LENGTH) {
			result += expression + ",";
			expression = getAssignmentExpression(assignment);
			chainLength = 0;
		} else if (assignment.t === 0 && previous.t === 0 && assignment.v === previous.v) expression = assignment.s + "=" + expression;
		else if (assignment.t === 2 && previous.t === 2 && assignment.s === previous.s) expression += ".set(" + assignment.k + "," + assignment.v + ")";
		else if (assignment.t === 1 && previous.t === 1 && assignment.s === previous.s) expression += ".add(" + assignment.v + ")";
		else if (assignment.t === 3 && previous.t === 2 && assignment.s === previous.s) expression += ".delete(" + assignment.k + ")";
		else {
			result += expression + ",";
			expression = getAssignmentExpression(assignment);
			chainLength = 0;
		}
		chainLength++;
		previous = assignment;
	}
	return result + expression + ",";
}
var NULL_CONSTRUCTOR = "Object.create(null)";
var SET_CONSTRUCTOR = "new Set";
var MAP_CONSTRUCTOR = "new Map";
var PROMISE_RESOLVE = "Promise.resolve";
var PROMISE_REJECT = "Promise.reject";
var OBJECT_FLAG_CONSTRUCTOR = {
	[3]: "Object.freeze",
	[2]: "Object.seal",
	[1]: "Object.preventExtensions",
	[0]: void 0
};
function createBaseSerializerContext(mode, options) {
	return {
		mode,
		plugins: options.plugins,
		features: options.features,
		marked: Array.isArray(options.markedRefs) ? new Set(options.markedRefs) : options.markedRefs,
		stack: [],
		flags: [],
		assignments: [],
		assignAll: mode === 2 && !options.assignSharedRefsOnly
	};
}
function createCrossSerializerContext(options) {
	return {
		mode: 2,
		base: createBaseSerializerContext(2, options),
		state: options
	};
}
/**
* Creates the reference param (identifier) from the given reference ID
* Calling this function means the value has been referenced somewhere
*/
function getVanillaRefParam(state, index) {
	/**
	* Creates a new reference ID from a given reference ID
	* This new reference ID means that the reference itself
	* has been referenced at least once, and is used to generate
	* the variables
	*/
	let actualIndex = state.valid.get(index);
	if (actualIndex == null) {
		actualIndex = state.valid.size;
		state.valid.set(index, actualIndex);
	}
	let identifier = state.vars[actualIndex];
	if (identifier == null) {
		identifier = getIdentifier(actualIndex);
		state.vars[actualIndex] = identifier;
	}
	return identifier;
}
function getCrossRefParam(id) {
	return "$R[" + id + "]";
}
/**
* Converts the ID of a reference into a identifier string
* that is used to refer to the object instance in the
* generated script.
*/
function getRefParam(ctx, id) {
	return ctx.mode === 1 ? getVanillaRefParam(ctx.state, id) : getCrossRefParam(id);
}
function markSerializerRef(ctx, id) {
	ctx.marked.add(id);
}
function isSerializerRefMarked(ctx, id) {
	return ctx.marked.has(id);
}
function pushObjectFlag(ctx, flag, id) {
	if (flag !== 0) {
		markSerializerRef(ctx.base, id);
		ctx.base.flags.push({
			type: flag,
			value: getRefParam(ctx, id)
		});
	}
}
function resolveFlags(ctx) {
	let result = "";
	for (let i = 0, current = ctx.flags, len = current.length; i < len; i++) {
		const flag = current[i];
		result += OBJECT_FLAG_CONSTRUCTOR[flag.type] + "(" + flag.value + "),";
	}
	return result;
}
function resolvePatches(ctx) {
	const assignments = resolveAssignments(ctx.assignments);
	const flags = resolveFlags(ctx);
	if (assignments) {
		if (flags) return assignments + flags;
		return assignments;
	}
	return flags;
}
/**
* Generates the inlined assignment for the reference
* This is different from the assignments array as this one
* signifies creation rather than mutation
*/
function createAssignment(ctx, source, value) {
	ctx.assignments.push({
		t: 0,
		s: source,
		k: void 0,
		v: value
	});
}
function createAddAssignment(ctx, ref, value) {
	ctx.base.assignments.push({
		t: 1,
		s: getRefParam(ctx, ref),
		k: void 0,
		v: value
	});
}
function createSetAssignment(ctx, ref, key, value) {
	ctx.base.assignments.push({
		t: 2,
		s: getRefParam(ctx, ref),
		k: key,
		v: value
	});
}
function createDeleteAssignment(ctx, ref, key) {
	ctx.base.assignments.push({
		t: 3,
		s: getRefParam(ctx, ref),
		k: key,
		v: void 0
	});
}
function createArrayAssign(ctx, ref, index, value) {
	createAssignment(ctx.base, getRefParam(ctx, ref) + "[" + index + "]", value);
}
function createObjectAssign(ctx, ref, key, value) {
	if (key === "__proto__") {
		ctx.base.assignments.push({
			t: 4,
			s: getRefParam(ctx, ref),
			k: value,
			v: void 0
		});
		return;
	}
	createAssignment(ctx.base, getRefParam(ctx, ref) + "." + key, value);
}
function createSequenceAssign(ctx, ref, index, value) {
	createAssignment(ctx.base, getRefParam(ctx, ref) + ".v[" + index + "]", value);
}
/**
* Checks if the value is in the stack. Stack here is a reference
* structure to know if a object is to be accessed in a TDZ.
*/
function getKeyKind(key) {
	const first = key.charCodeAt(0);
	if (first >= 48 && first <= 57) {
		const check = Number(key);
		return check >= 0 && check.toString() === key ? 2 : 0;
	}
	if (key === "Infinity") return 2;
	return isValidIdentifier(key) ? 1 : 0;
}
function isIndexedValueInStack(ctx, node) {
	return node.t === 4 && ctx.stack.includes(node.i);
}
/**
* Checks if the node, or any node inside it, is read from more than one
* place. Such a node must not be created inside a deferred assignment,
* because the places that read it may run before the assignment does.
*/
function hasMarkedNode(ctx, node) {
	if (Array.isArray(node)) {
		for (let i = 0, len = node.length; i < len; i++) if (hasMarkedNode(ctx, node[i])) return true;
		return false;
	}
	if (node == null || typeof node !== "object") return false;
	const current = node;
	if (current.t !== 4 && typeof current.i === "number" && isSerializerRefMarked(ctx, current.i)) return true;
	for (const key in current) if (hasMarkedNode(ctx, current[key])) return true;
	return false;
}
/**
* Produces an assignment expression. `id` generates a reference
* parameter (through `getRefParam`) and has the option to
* return the reference parameter directly or assign a value to
* it.
*/
function assignIndexedValue(ctx, index, value) {
	if (!ctx.base.assignAll && !isSerializerRefMarked(ctx.base, index)) return value;
	/**
	* In cross-reference, we have to assume that
	* every reference are going to be referenced
	* in the future, and so we need to store
	* all of it into the reference array.
	*
	* otherwise in vanilla, we only do this if it
	* is actually referenced. `assignSharedRefsOnly` gives cross-reference
	* output the vanilla behavior.
	*/
	return getRefParam(ctx, index) + "=" + value;
}
function serializeReference(node) {
	return REFERENCES_KEY + ".get(\"" + node.s + "\")";
}
function serializeArrayItem(ctx, id, item, index) {
	if (item) {
		if (isIndexedValueInStack(ctx.base, item)) {
			markSerializerRef(ctx.base, id);
			createArrayAssign(ctx, id, index, getRefParam(ctx, item.i));
			return "";
		}
		return serialize$1(ctx, item);
	}
	return "";
}
function serializeArray(ctx, node) {
	const id = node.i;
	const list = node.a;
	const len = list.length;
	if (len > 0) {
		ctx.base.stack.push(id);
		let values = serializeArrayItem(ctx, id, list[0], 0);
		let isHoley = values === "";
		for (let i = 1, item; i < len; i++) {
			item = serializeArrayItem(ctx, id, list[i], i);
			values += "," + item;
			isHoley = item === "";
		}
		ctx.base.stack.pop();
		pushObjectFlag(ctx, node.o, node.i);
		return "[" + values + (isHoley ? ",]" : "]");
	}
	return "[]";
}
function serializeProperty(ctx, source, key, val) {
	if (typeof key === "string") {
		const kind = getKeyKind(key);
		if (isIndexedValueInStack(ctx.base, val)) {
			const refParam = getRefParam(ctx, val.i);
			markSerializerRef(ctx.base, source.i);
			if (kind === 1) createObjectAssign(ctx, source.i, key, refParam);
			else createArrayAssign(ctx, source.i, kind === 2 ? key : "\"" + key + "\"", refParam);
			return "";
		}
		if (key !== "__proto__") return (kind === 0 ? "\"" + key + "\"" : key) + ":" + serialize$1(ctx, val);
		return "[\"" + key + "\"]:" + serialize$1(ctx, val);
	}
	return "[" + serialize$1(ctx, key) + "]:" + serialize$1(ctx, val);
}
function serializeProperties(ctx, source, record) {
	const keys = record.k;
	const len = keys.length;
	if (len > 0) {
		const values = record.v;
		ctx.base.stack.push(source.i);
		let result = serializeProperty(ctx, source, keys[0], values[0]);
		for (let i = 1, item; i < len; i++) {
			item = serializeProperty(ctx, source, keys[i], values[i]);
			result += (item && result && ",") + item;
		}
		ctx.base.stack.pop();
		return "{" + result + "}";
	}
	return "{}";
}
function serializeObject(ctx, node) {
	pushObjectFlag(ctx, node.o, node.i);
	return serializeProperties(ctx, node, node.p);
}
function serializeWithObjectAssign(ctx, source, value, serialized) {
	const fields = serializeProperties(ctx, source, value);
	if (fields !== "{}") return "Object.assign(" + serialized + "," + fields + ")";
	return serialized;
}
function serializeStringKeyAssignment(ctx, source, mainAssignments, key, value) {
	const base = ctx.base;
	const serialized = serialize$1(ctx, value);
	const parentAssignment = base.assignments;
	if (!isIndexedValueInStack(base, value)) base.assignments = mainAssignments;
	createKeyAssign(ctx, source.i, getKeyKind(key), key, serialized);
	base.assignments = parentAssignment;
}
function createKeyAssign(ctx, ref, kind, key, value) {
	if (kind === 1) createObjectAssign(ctx, ref, key, value);
	else createArrayAssign(ctx, ref, kind === 2 ? key : "\"" + key + "\"", value);
}
function serializeAssignment(ctx, source, mainAssignments, key, value) {
	if (typeof key === "string") serializeStringKeyAssignment(ctx, source, mainAssignments, key, value);
	else {
		const base = ctx.base;
		const parent = base.stack;
		base.stack = [];
		const serialized = serialize$1(ctx, value);
		base.stack = parent;
		const parentAssignment = base.assignments;
		base.assignments = mainAssignments;
		createArrayAssign(ctx, source.i, serialize$1(ctx, key), serialized);
		base.assignments = parentAssignment;
	}
}
function serializeAssignments(ctx, source, node) {
	const keys = node.k;
	const len = keys.length;
	if (len > 0) {
		const mainAssignments = [];
		const values = node.v;
		ctx.base.stack.push(source.i);
		for (let i = 0; i < len; i++) serializeAssignment(ctx, source, mainAssignments, keys[i], values[i]);
		ctx.base.stack.pop();
		return resolveAssignments(mainAssignments);
	}
}
function serializeDictionary(ctx, node, init) {
	if (node.p) {
		const base = ctx.base;
		if (base.features & 8 && !node.p.k.includes("__proto__")) init = serializeWithObjectAssign(ctx, node, node.p, init);
		else {
			markSerializerRef(base, node.i);
			const assignments = serializeAssignments(ctx, node, node.p);
			if (assignments) return "(" + assignIndexedValue(ctx, node.i, init) + "," + assignments + getRefParam(ctx, node.i) + ")";
		}
	}
	return init;
}
function serializeNullConstructor(ctx, node) {
	pushObjectFlag(ctx, node.o, node.i);
	return serializeDictionary(ctx, node, NULL_CONSTRUCTOR);
}
function serializeDate(node) {
	return "new Date(\"" + node.s + "\")";
}
function serializeTemporal(ctx, node) {
	if (ctx.base.features & 64) return "Temporal." + TEMPORAL_TYPE_NAME[node.c] + ".from(\"" + node.s + "\")";
	throw new SerovalUnsupportedNodeError(node);
}
function serializeRegExp(ctx, node) {
	if (ctx.base.features & 32) {
		if (node.c.includes("\\x3C")) return "new RegExp(\"" + node.c + "\",\"" + node.m + "\")";
		return "/" + deserializeString(node.c) + "/" + node.m;
	}
	throw new SerovalUnsupportedNodeError(node);
}
function serializeSetItem(ctx, id, item) {
	const base = ctx.base;
	if (isIndexedValueInStack(base, item)) {
		markSerializerRef(base, id);
		createAddAssignment(ctx, id, getRefParam(ctx, item.i));
		return "";
	}
	return serialize$1(ctx, item);
}
function serializeSet(ctx, node) {
	let serialized = SET_CONSTRUCTOR;
	const items = node.a;
	const size = items.length;
	const id = node.i;
	if (size > 0) {
		ctx.base.stack.push(id);
		let result = serializeSetItem(ctx, id, items[0]);
		for (let i = 1, item; i < size; i++) {
			item = serializeSetItem(ctx, id, items[i]);
			result += (item && result && ",") + item;
		}
		ctx.base.stack.pop();
		if (result) serialized += "([" + result + "])";
	}
	return serialized;
}
function serializeMapEntry(ctx, id, key, val, getSentinel) {
	const base = ctx.base;
	if (isIndexedValueInStack(base, key)) {
		const keyRef = getRefParam(ctx, key.i);
		markSerializerRef(base, id);
		if (isIndexedValueInStack(base, val)) {
			createSetAssignment(ctx, id, keyRef, getRefParam(ctx, val.i));
			return "";
		}
		if (val.t !== 4 && val.i != null && hasMarkedNode(base, val)) {
			markSerializerRef(base, val.i);
			const sentinel = getSentinel();
			const serialized = "(" + serialize$1(ctx, val) + ",[" + sentinel + "," + sentinel + "])";
			createSetAssignment(ctx, id, keyRef, getRefParam(ctx, val.i));
			createDeleteAssignment(ctx, id, sentinel);
			return serialized;
		}
		const parent = base.stack;
		base.stack = [];
		createSetAssignment(ctx, id, keyRef, serialize$1(ctx, val));
		base.stack = parent;
		return "";
	}
	if (isIndexedValueInStack(base, val)) {
		const valueRef = getRefParam(ctx, val.i);
		markSerializerRef(base, id);
		if (key.t !== 4 && key.i != null && hasMarkedNode(base, key)) {
			markSerializerRef(base, key.i);
			const sentinel = getSentinel();
			const serialized = "(" + serialize$1(ctx, key) + ",[" + sentinel + "," + sentinel + "])";
			createSetAssignment(ctx, id, getRefParam(ctx, key.i), valueRef);
			createDeleteAssignment(ctx, id, sentinel);
			return serialized;
		}
		const parent = base.stack;
		base.stack = [];
		createSetAssignment(ctx, id, serialize$1(ctx, key), valueRef);
		base.stack = parent;
		return "";
	}
	return "[" + serialize$1(ctx, key) + "," + serialize$1(ctx, val) + "]";
}
function serializeMap(ctx, node) {
	let serialized = MAP_CONSTRUCTOR;
	const keys = node.e.k;
	const size = keys.length;
	const id = node.i;
	const sentinel = node.f;
	let sentinelRef;
	const getSentinel = () => {
		if (sentinelRef == null) {
			sentinelRef = getRefParam(ctx, sentinel.i);
			if (ctx.mode === 1) ctx.state.sentinels.add(ctx.state.valid.get(sentinel.i));
		}
		return sentinelRef;
	};
	const base = ctx.base;
	if (size > 0) {
		const vals = node.e.v;
		base.stack.push(id);
		let result = serializeMapEntry(ctx, id, keys[0], vals[0], getSentinel);
		for (let i = 1, item; i < size; i++) {
			item = serializeMapEntry(ctx, id, keys[i], vals[i], getSentinel);
			result += (item && result && ",") + item;
		}
		base.stack.pop();
		if (result) serialized += "([" + result + "])";
	}
	if (ctx.mode === 2 && sentinel.t === 26) {
		markSerializerRef(base, sentinel.i);
		serialized = "(" + serialize$1(ctx, sentinel) + "," + serialized + ")";
	}
	return serialized;
}
function serializeArrayBuffer(ctx, node) {
	return getConstructor(ctx, node.f) + "(\"" + node.s + "\")";
}
function serializeView(ctx, node) {
	return "new " + (node.t === 20 ? "DataView" : node.c) + "(" + serialize$1(ctx, node.f) + "," + node.b + "," + node.l + ")";
}
function serializeAggregateError(ctx, node) {
	const id = node.i;
	ctx.base.stack.push(id);
	const serialized = serializeDictionary(ctx, node, "new AggregateError([],\"" + node.m + "\")");
	ctx.base.stack.pop();
	return serialized;
}
function serializeError(ctx, node) {
	return serializeDictionary(ctx, node, "new " + ERROR_CONSTRUCTOR_STRING[node.s] + "(\"" + node.m + "\")");
}
function serializePromise(ctx, node) {
	let serialized;
	const fulfilled = node.f;
	const id = node.i;
	const promiseConstructor = node.s ? PROMISE_RESOLVE : PROMISE_REJECT;
	const base = ctx.base;
	if (isIndexedValueInStack(base, fulfilled)) {
		const ref = getRefParam(ctx, fulfilled.i);
		serialized = promiseConstructor + (node.s ? "().then(" + createFunction([], ref) + ")" : "().catch(" + createEffectfulFunction([], "throw " + ref) + ")");
	} else {
		base.stack.push(id);
		const result = serialize$1(ctx, fulfilled);
		base.stack.pop();
		serialized = promiseConstructor + "(" + result + ")";
	}
	return serialized;
}
function serializeBoxed(ctx, node) {
	return "Object(" + serialize$1(ctx, node.f) + ")";
}
function getConstructor(ctx, node) {
	const current = serialize$1(ctx, node);
	return node.t === 4 ? current : "(" + current + ")";
}
function serializePromiseConstructor(ctx, node) {
	if (ctx.mode === 1) throw new SerovalUnsupportedNodeError(node);
	return "(" + assignIndexedValue(ctx, node.s, getConstructor(ctx, node.f) + "()") + ").p";
}
function serializePromiseResult(ctx, node) {
	if (ctx.mode === 1) throw new SerovalUnsupportedNodeError(node);
	return getConstructor(ctx, node.a[0]) + "(" + getRefParam(ctx, node.i) + "," + serialize$1(ctx, node.a[1]) + ")";
}
function serializePlugin(ctx, node) {
	const currentPlugins = ctx.base.plugins;
	if (currentPlugins) for (let i = 0, len = currentPlugins.length; i < len; i++) {
		const plugin = currentPlugins[i];
		if (plugin.tag === node.c) return plugin.serialize(node.s, { serialize: (current) => serialize$1(ctx, current) }, { id: node.i });
	}
	throw new SerovalMissingPluginError(node.c);
}
function serializeIteratorFactory(ctx, node) {
	let result = "";
	let initialized = false;
	if (node.f.t !== 4) {
		markSerializerRef(ctx.base, node.f.i);
		result = "(" + serialize$1(ctx, node.f) + ",";
		initialized = true;
	}
	result += assignIndexedValue(ctx, node.i, "(" + SERIALIZED_ITERATOR_CONSTRUCTOR + ")(" + getRefParam(ctx, node.f.i) + ")");
	if (initialized) result += ")";
	return result;
}
function serializeIteratorFactoryInstance(ctx, node) {
	return getConstructor(ctx, node.a[0]) + "(" + serialize$1(ctx, node.a[1]) + ")";
}
function serializeAsyncIteratorFactory(ctx, node) {
	const promise = node.a[0];
	const symbol = node.a[1];
	const base = ctx.base;
	let result = "";
	if (promise.t !== 4) {
		markSerializerRef(base, promise.i);
		result += "(" + serialize$1(ctx, promise);
	}
	if (symbol.t !== 4) {
		markSerializerRef(base, symbol.i);
		result += (result ? "," : "(") + serialize$1(ctx, symbol);
	}
	if (result) result += ",";
	const iterator = assignIndexedValue(ctx, node.i, "(" + SERIALIZED_ASYNC_ITERATOR_CONSTRUCTOR + ")(" + getRefParam(ctx, symbol.i) + "," + getRefParam(ctx, promise.i) + ")");
	if (result) return result + iterator + ")";
	return iterator;
}
function serializeStreamConstructor(ctx, node) {
	const result = assignIndexedValue(ctx, node.i, getConstructor(ctx, node.f) + (node.l === 1 ? "(1)" : "()"));
	const len = node.a.length;
	if (len) {
		let values = serialize$1(ctx, node.a[0]);
		for (let i = 1; i < len; i++) values += "," + serialize$1(ctx, node.a[i]);
		return "(" + result + "," + values + "," + getRefParam(ctx, node.i) + ")";
	}
	return result;
}
function serializeStreamCall(ctx, node, method) {
	return getRefParam(ctx, node.i) + "." + method + "(" + serialize$1(ctx, node.f) + ")";
}
function serializeSequenceItem(ctx, id, index, item) {
	const base = ctx.base;
	if (isIndexedValueInStack(base, item)) {
		markSerializerRef(base, id);
		createSequenceAssign(ctx, id, index, getRefParam(ctx, item.i));
		return "";
	}
	return serialize$1(ctx, item);
}
function serializeSequence(ctx, node) {
	const items = node.a;
	const size = items.length;
	const id = node.i;
	if (size > 0) {
		ctx.base.stack.push(id);
		let result = serializeSequenceItem(ctx, id, 0, items[0]);
		for (let i = 1, item; i < size; i++) {
			item = serializeSequenceItem(ctx, id, i, items[i]);
			result += (item && result && ",") + item;
		}
		ctx.base.stack.pop();
		if (result) return "{__SEROVAL_SEQUENCE__:!0,v:[" + result + "],t:" + node.s + ",d:" + node.l + "}";
	}
	return "{__SEROVAL_SEQUENCE__:!0,v:[],t:-1,d:0}";
}
function serializeAssignable(ctx, node) {
	switch (node.t) {
		case 17: return SYMBOL_STRING[node.s];
		case 18: return serializeReference(node);
		case 9: return serializeArray(ctx, node);
		case 10: return serializeObject(ctx, node);
		case 11: return serializeNullConstructor(ctx, node);
		case 5: return serializeDate(node);
		case 6: return serializeRegExp(ctx, node);
		case 7: return serializeSet(ctx, node);
		case 8: return serializeMap(ctx, node);
		case 19: return serializeArrayBuffer(ctx, node);
		case 16:
		case 15:
		case 20: return serializeView(ctx, node);
		case 14: return serializeAggregateError(ctx, node);
		case 13: return serializeError(ctx, node);
		case 12: return serializePromise(ctx, node);
		case 21: return serializeBoxed(ctx, node);
		case 22: return serializePromiseConstructor(ctx, node);
		case 25: return serializePlugin(ctx, node);
		case 26: return SPECIAL_REF_STRING[node.s];
		case 35: return serializeSequence(ctx, node);
		case 36: return serializeTemporal(ctx, node);
		default: throw new SerovalUnsupportedNodeError(node);
	}
}
function serialize$1(ctx, node) {
	switch (node.t) {
		case 2: return CONSTANT_STRING[node.s];
		case 0: return "" + node.s;
		case 1: return "\"" + node.s + "\"";
		case 3: return node.s + "n";
		case 4: return getRefParam(ctx, node.i);
		case 23:
		case 24: return serializePromiseResult(ctx, node);
		case 27: return serializeIteratorFactory(ctx, node);
		case 28:
		case 30: return serializeIteratorFactoryInstance(ctx, node);
		case 29: return serializeAsyncIteratorFactory(ctx, node);
		case 31: return serializeStreamConstructor(ctx, node);
		case 32: return serializeStreamCall(ctx, node, "next");
		case 33: return serializeStreamCall(ctx, node, "throw");
		case 34: return serializeStreamCall(ctx, node, "return");
		default: return assignIndexedValue(ctx, node.i, serializeAssignable(ctx, node));
	}
}
function serializeCross(ctx, tree) {
	const result = serialize$1(ctx, tree);
	const id = tree.i;
	if (id == null) return result;
	const patches = resolvePatches(ctx.base);
	const ref = getRefParam(ctx, id);
	const scopeId = ctx.state.scopeId;
	const params = scopeId == null ? "" : "$R";
	let body = result;
	if (patches) {
		if (!ctx.base.assignAll && !result.startsWith(ref + "=")) body = ref + "=" + result;
		body = "(" + body + "," + patches + ref + ")";
	}
	if (params === "") {
		if (tree.t === 10 && !patches) return "(" + body + ")";
		return body;
	}
	const args = scopeId == null ? "()" : "($R[\"" + serializeString(scopeId) + "\"])";
	return "(" + createFunction([params], body) + ")" + args;
}
function wrapSerializationError(error) {
	return error instanceof SerovalSerializationError ? error : new SerovalSerializationError(error);
}
function serializeTopCross(ctx, tree) {
	try {
		return serializeCross(ctx, tree);
	} catch (error) {
		throw wrapSerializationError(error);
	}
}
function parseItems(ctx, depth, current) {
	const len = current.length;
	const nodes = new Array(len);
	for (let i = 0; i < len; i++) if (i in current) nodes[i] = parseSOS(ctx, depth, current[i]);
	else nodes[i] = 0;
	return nodes;
}
function parseArray(ctx, depth, id, current) {
	return createArrayNode(id, current, parseItems(ctx, depth, current));
}
function parseProperties(ctx, depth, properties) {
	const keys = Object.keys(properties);
	const len = keys.length;
	const keyNodes = new Array(len);
	const valueNodes = new Array(len);
	for (let i = 0, key; i < len; i++) {
		key = keys[i];
		keyNodes[i] = serializeString(key);
		valueNodes[i] = parseSOS(ctx, depth, properties[key]);
	}
	if (SYM_ITERATOR in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_ITERATOR));
		valueNodes.push(createIteratorFactoryInstanceNode(28, parseIteratorFactory(ctx.base), parseSOS(ctx, depth, createSequenceFromIterable(properties))));
	}
	if (SYM_ASYNC_ITERATOR in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_ASYNC_ITERATOR));
		valueNodes.push(createIteratorFactoryInstanceNode(30, parseAsyncIteratorFactory(ctx.base), parseAsyncIterable(ctx, depth, properties)));
	}
	if (SYM_TO_STRING_TAG in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_TO_STRING_TAG));
		valueNodes.push(createStringNode(properties[SYM_TO_STRING_TAG]));
	}
	if (SYM_IS_CONCAT_SPREADABLE in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_IS_CONCAT_SPREADABLE));
		valueNodes.push(properties[SYM_IS_CONCAT_SPREADABLE] ? TRUE_NODE : FALSE_NODE);
	}
	return {
		k: keyNodes,
		v: valueNodes
	};
}
function parseAsyncIterable(ctx, depth, current) {
	if (ctx.type !== 2) throw new SerovalUnsupportedTypeError(current);
	const id = createIndexForValue(ctx.base, {});
	const result = createStreamConstructorNode(id, parseSpecialReference(ctx.base, 4), []);
	ctx.state.iterable(ctx, depth, id, current);
	return result;
}
function parsePlainObject(ctx, depth, id, current, empty) {
	return createObjectNode(id, current, empty, parseProperties(ctx, depth, current));
}
function parseBoxed(ctx, depth, id, current) {
	return createBoxedNode(id, parseSOS(ctx, depth, current.valueOf()));
}
function parseView(ctx, depth, type, id, current) {
	current = getArrayBufferView(ctx.base, current);
	return createViewNode(type, id, current, parseSOS(ctx, depth, current.buffer));
}
function parseError(ctx, depth, type, id, current) {
	const options = getErrorOptions(current, ctx.base.features);
	return createErrorNode(type, id, current, options ? parseProperties(ctx, depth, options) : void 0);
}
function parseMap(ctx, depth, id, current) {
	const sentinel = parseMapSentinel(ctx.base);
	const keyNodes = new Array(current.size);
	const valueNodes = new Array(current.size);
	let i = 0;
	for (const [key, value] of current.entries()) {
		keyNodes[i] = parseSOS(ctx, depth, key);
		valueNodes[i] = parseSOS(ctx, depth, value);
		i++;
	}
	return createMapNode(id, sentinel, keyNodes, valueNodes);
}
function parseSet(ctx, depth, id, current) {
	const items = new Array(current.size);
	let i = 0;
	for (const item of current.keys()) items[i++] = parseSOS(ctx, depth, item);
	return createSetNode(id, items);
}
/**
* Sends the events of a stream that has ended, so the copy gets all of them.
* A stream that is still open throws, because the other sync modes cannot
* send its later events.
*/
function parseEndedStream(ctx, depth, id, current) {
	const events = current.endedEvents();
	if (!events) throw new SerovalUnsupportedTypeError(current);
	const values = events.values;
	const last = values.length - 1;
	const sequence = new Array(values.length);
	if (last >= 0) markParserRef(ctx.base, id);
	for (let i = 0; i <= last; i++) sequence[i] = createStreamEventNode(i < last ? 32 : events.success ? 34 : 33, id, parseSOS(ctx, depth, values[i]));
	return sequence;
}
function parseStream(ctx, depth, id, current) {
	const reference = parseSpecialReference(ctx.base, 4);
	if (ctx.type === 2) {
		const result = createStreamConstructorNode(id, reference, []);
		ctx.state.stream(ctx, depth, id, current);
		return result;
	}
	return createStreamConstructorNode(id, reference, parseEndedStream(ctx, depth, id, current));
}
function parseLiveStream(ctx, depth, id, current) {
	if (ctx.type !== 2) throw new SerovalUnsupportedTypeError(current);
	const result = createStreamConstructorNode(id, parseSpecialReference(ctx.base, 4), [], 1);
	ctx.state.live(ctx, depth, id, current);
	return result;
}
function parsePromise(ctx, depth, id, current) {
	if (ctx.type !== 2) throw new SerovalUnsupportedTypeError(current);
	const resolver = createIndexForValue(ctx.base, {});
	ctx.state.promise(ctx, resolver, depth, current);
	return createPromiseConstructorNode(ctx.base, id, resolver);
}
function parsePluginSync(ctx, depth, id, current, currentPlugins) {
	for (let i = 0, len = currentPlugins.length; i < len; i++) {
		const plugin = currentPlugins[i];
		if (plugin.parse.sync && plugin.test(current)) return createPluginNode(id, plugin.tag, plugin.parse.sync(current, { parse: (value) => parseSOS(ctx, depth, value) }, { id }));
	}
}
function parsePlugin(ctx, depth, id, current, currentPlugins) {
	if (currentPlugins) return ctx.type === 1 ? parsePluginSync(ctx, depth, id, current, currentPlugins) : ctx.state.plugin(ctx, depth, id, current, currentPlugins);
}
function parseSequence(ctx, depth, id, current) {
	const len = current.v.length;
	const nodes = new Array(len);
	for (let i = 0; i < len; i++) nodes[i] = parseSOS(ctx, depth, current.v[i]);
	return createSequenceNode(id, nodes, current.t, current.d);
}
function parseObjectPhase2(ctx, depth, id, current, currentClass) {
	if (currentClass === Object) return parsePlainObject(ctx, depth, id, current, false);
	switch (getObjectKind(current, currentClass, ctx.base.features)) {
		case 2: return parsePlainObject(ctx, depth, id, current, true);
		case 3: return createDateNode(id, current);
		case 4: return parseError(ctx, depth, 13, id, current);
		case 5: return parseError(ctx, depth, 14, id, current);
		case 6: return parseBoxed(ctx, depth, id, current);
		case 7: return createArrayBufferNode(ctx.base, id, current);
		case 8: return parseView(ctx, depth, 15, id, current);
		case 9: return parseView(ctx, depth, 16, id, current);
		case 10: return parseView(ctx, depth, 20, id, current);
		case 11: return parseMap(ctx, depth, id, current);
		case 12: return parseSet(ctx, depth, id, current);
		case 13: return parsePromise(ctx, depth, id, current);
		case 14: return createRegExpNode(id, current);
		case 15: return createTemporalNode(id, getTemporalType(currentClass), current);
		case 16: return parsePlainObject(ctx, depth, id, current, !!currentClass);
		default: throw new SerovalUnsupportedTypeError(current);
	}
}
function parseObject(ctx, depth, id, current) {
	if (Array.isArray(current)) return parseArray(ctx, depth, id, current);
	if (isStream(current)) return isLiveStream(current) ? parseLiveStream(ctx, depth, id, current) : parseStream(ctx, depth, id, current);
	if (isSequence(current)) return parseSequence(ctx, depth, id, current);
	const currentClass = getObjectClass(current);
	if (currentClass === OpaqueReference) return parseSOS(ctx, depth, current.replacement);
	const parsed = parsePlugin(ctx, depth, id, current, getObjectPlugins(ctx.base, current, currentClass));
	if (parsed) return parsed;
	return parseObjectPhase2(ctx, depth, id, current, currentClass);
}
function parseFunction(ctx, depth, current) {
	const ref = getReferenceNode(ctx.base, current);
	if (typeof ref !== "number") return ref;
	const plugin = parsePlugin(ctx, depth, ref, current, ctx.base.plugins);
	if (plugin) return plugin;
	throw new SerovalUnsupportedTypeError(current);
}
function parseSOS(ctx, depth, current) {
	if (depth >= ctx.base.depthLimit) throw new SerovalDepthLimitError(ctx.base.depthLimit);
	switch (typeof current) {
		case "boolean": return current ? TRUE_NODE : FALSE_NODE;
		case "undefined": return UNDEFINED_NODE;
		case "string": return createStringNode(current);
		case "number": return createNumberNode(current);
		case "bigint": return createBigIntNode(current);
		case "object":
			if (current) {
				const ref = getReferenceNode(ctx.base, current);
				return typeof ref === "number" ? parseObject(ctx, depth + 1, ref, current) : ref;
			}
			return NULL_NODE;
		case "symbol": return parseWellKnownSymbol(ctx.base, current);
		case "function": return parseFunction(ctx, depth, current);
		default: throw new SerovalUnsupportedTypeError(current);
	}
}
/**
* Streaming parse mode. Everything here is reached through the function
* fields of the stream parser state, which only `createStreamParserContext`
* sets, so synchronous consumers (`serialize`, `toJSON`) never bundle it.
*/
function createStreamParsePluginContext(ctx, depth) {
	const state = ctx.state;
	function parse(current) {
		state.parsing++;
		try {
			return parseSOS(ctx, depth, current);
		} finally {
			state.parsing--;
			if (!state.alive) releaseParserValues(ctx);
		}
	}
	return {
		parse,
		parseStreamSource(current) {
			state.parsing++;
			try {
				if (depth >= ctx.base.depthLimit) throw new SerovalDepthLimitError(ctx.base.depthLimit);
				const id = createIndexForValue(ctx.base, {});
				const node = createStreamConstructorNode(id, parseSpecialReference(ctx.base, 4), [], 1);
				iterateAsync(ctx, depth + 1, id, current, true);
				return node;
			} finally {
				state.parsing--;
				if (!state.alive) releaseParserValues(ctx);
			}
		},
		parseWithError(current) {
			try {
				return parse(current);
			} catch (error) {
				stopStreamParse(ctx, 1, error);
				return;
			}
		},
		isAlive: () => state.alive,
		pushPendingState: () => {
			pushPendingState(ctx);
		},
		popPendingState: () => {
			popPendingState(ctx);
		},
		onParse(node) {
			if (state.alive) {
				state.queue.push({
					node,
					initial: false,
					accept: void 0
				});
				drainOutput(ctx);
			}
		},
		onError(error) {
			stopStreamParse(ctx, 1, error);
		},
		addCleanup(callback) {
			addCleanup(ctx, callback);
		}
	};
}
function getStreamParsePluginContext(ctx, depth) {
	const contexts = ctx.state.pluginContexts;
	return contexts[depth] ?? (contexts[depth] = createStreamParsePluginContext(ctx, depth));
}
function addCleanup(ctx, callback) {
	if (ctx.state.alive) ctx.state.cleanups.push(callback);
	else callback();
}
function parsePluginStream(ctx, depth, id, current, currentPlugins) {
	for (let i = 0, len = currentPlugins.length; i < len; i++) {
		const plugin = currentPlugins[i];
		if (plugin.parse.stream && plugin.test(current)) return createPluginNode(id, plugin.tag, plugin.parse.stream(current, getStreamParsePluginContext(ctx, depth), { id }));
	}
}
/**
* One listener shape serves both `Stream.on` (no accept) and
* `LiveStream.pump` (accept tied to record acceptance). Handlers return the
* parse error so the pump can stop the source.
*/
function streamListener(ctx, depth, id, subscription) {
	const handle = (type, terminal) => (value, accept) => {
		let failure = void 0;
		if (ctx.state.alive) try {
			failure = parseEvent(ctx, depth, value, createStreamEventNode.bind(null, type, id), accept);
		} catch (error) {
			if (!subscription?.active) throw error;
			subscription.failure ?? (subscription.failure = { value: error });
			failure = error;
		}
		if (terminal && !accept) popPendingState(ctx);
		return failure;
	};
	return {
		next: handle(32, false),
		throw: handle(33, true),
		return: handle(34, true),
		done() {
			popPendingState(ctx);
		},
		error(reason) {
			if (ctx.state.alive) stopStreamParse(ctx, 1, reason);
		}
	};
}
function subscribeStream(ctx, depth, id, current) {
	pushPendingState(ctx);
	const subscription = {
		active: true,
		failure: void 0
	};
	let cleanup;
	try {
		cleanup = current.on(streamListener(ctx, depth, id, subscription));
	} finally {
		subscription.active = false;
	}
	try {
		addCleanup(ctx, cleanup);
	} catch (error) {
		subscription.failure ?? (subscription.failure = { value: error });
	}
	const failure = subscription.failure;
	subscription.failure = void 0;
	if (failure) throw failure.value;
}
function consumeLiveStream(ctx, depth, id, current) {
	const cancel = current.pump(streamListener(ctx, depth, id));
	pushPendingState(ctx);
	addCleanup(ctx, () => {
		cancel(ctx.state.reason);
	});
}
function wrapPromiseResult(ctx, type, id, node) {
	return createSerovalNode(type, id, void 0, void 0, void 0, void 0, void 0, [parseSpecialReference(ctx.base, type === 23 ? 2 : 3), node], void 0, void 0, void 0, void 0);
}
function handlePromise(type, id, depth, data) {
	if (this.state.alive) parseEvent(this, depth, data, wrapPromiseResult.bind(null, this, type, id), void 0);
	popPendingState(this);
}
function watchPromise(ctx, resolver, depth, current) {
	pushPendingState(ctx);
	current.then(handlePromise.bind(ctx, 23, resolver, depth), handlePromise.bind(ctx, 24, resolver, depth));
}
function returnIterator(iterator) {
	Promise.resolve().then(() => iterator.return?.()).catch(() => {});
}
/**
* Drives an async iterator directly. The next value is pulled only after the
* record for the previous one has been accepted, and cancellation returns
* the iterator once.
*/
function iterateAsync(ctx, depth, id, current, forwardReason) {
	const iterator = current[SYM_ASYNC_ITERATOR]();
	const listener = streamListener(ctx, depth, id);
	let active = true;
	function stop() {
		if (active) {
			active = false;
			if (forwardReason) try {
				Promise.resolve(iterator.return?.(ctx.state.reason)).catch(() => {});
			} catch {}
			else returnIterator(iterator);
		}
	}
	function pull() {
		if (active) iterator.next().then((result) => {
			if (active) {
				if (result.done) {
					active = false;
					listener.return(result.value, void 0);
				} else if (listener.next(result.value, pull) !== void 0) {
					stop();
					listener.done();
				}
			}
		}, (error) => {
			if (active) {
				active = false;
				listener.throw(error, void 0);
			}
		});
	}
	pushPendingState(ctx);
	addCleanup(ctx, stop);
	pull();
}
function createStreamParserState(options) {
	return {
		alive: true,
		pending: 0,
		parsing: 0,
		queue: [],
		writing: false,
		inFlight: void 0,
		reason: void 0,
		onParse: options.onParse,
		onError: options.onError,
		onDone: options.onDone,
		cleanups: [],
		pluginContexts: [],
		stream: subscribeStream,
		live: consumeLiveStream,
		promise: watchPromise,
		iterable: iterateAsync,
		plugin: parsePluginStream
	};
}
function createStreamParserContext(options) {
	return {
		type: 2,
		base: createBaseParserContext(options),
		state: createStreamParserState(options)
	};
}
function pushPendingState(ctx) {
	if (ctx.state.alive) ctx.state.pending++;
}
function popPendingState(ctx) {
	if (ctx.state.alive) {
		ctx.state.pending--;
		checkStreamParse(ctx);
	}
}
/**
* Parses a value that arrived after the root. Its record is queued before
* parsing starts so that records discovered inside it follow it, and it is
* dropped again if parsing fails. Returns the parse error after reporting
* it, or `undefined`.
*/
function parseEvent(ctx, depth, value, wrap, accept) {
	const state = ctx.state;
	const record = {
		node: void 0,
		initial: false,
		accept
	};
	let failure;
	state.queue.push(record);
	state.parsing++;
	try {
		record.node = wrap(parseSOS(ctx, depth, value));
	} catch (error) {
		failure = { value: error };
	} finally {
		state.parsing--;
		if (!state.alive) releaseParserValues(ctx);
	}
	if (failure) stopStreamParse(ctx, 1, failure.value);
	else drainOutput(ctx);
	return failure?.value;
}
/**
* Emits queued records one at a time. A callback that returns a promise
* pauses emission until it settles; the source event behind the record is
* accepted only after that.
*/
function drainOutput(ctx) {
	const state = ctx.state;
	if (state.writing || state.parsing > 0) return;
	while (state.alive && state.queue.length > 0) {
		const record = state.queue.shift();
		if (!record.node) continue;
		let pending;
		state.writing = true;
		state.inFlight = record;
		state.parsing++;
		try {
			if (!state.onParse) throw new Error("Stream output callback is unavailable");
			const result = state.onParse(record.node, record.initial);
			if (result !== null && (typeof result === "object" || typeof result === "function")) {
				const then = Reflect.get(result, "then");
				if (typeof then === "function") pending = new Promise((resolve, reject) => {
					Reflect.apply(then, result, [resolve, reject]);
				});
			}
		} catch (error) {
			releaseRecord(record);
			stopStreamParse(ctx, 1, error);
			return;
		} finally {
			state.parsing--;
			if (!state.alive) releaseParserValues(ctx);
		}
		record.node = void 0;
		if (pending) {
			if (!state.alive) releaseRecord(record);
			pending.then(() => {
				state.writing = false;
				state.inFlight = void 0;
				if (state.alive) {
					const accept = record.accept;
					releaseRecord(record);
					accept?.();
					drainOutput(ctx);
				}
			}, (error) => {
				state.writing = false;
				state.inFlight = void 0;
				releaseRecord(record);
				stopStreamParse(ctx, 1, error);
			});
			return;
		}
		if (!state.alive) {
			releaseRecord(record);
			return;
		}
		state.writing = false;
		state.inFlight = void 0;
		const accept = record.accept;
		releaseRecord(record);
		accept?.();
	}
	checkStreamParse(ctx);
}
function checkStreamParse(ctx) {
	const state = ctx.state;
	if (state.alive && state.parsing === 0 && state.pending <= 0 && state.queue.length === 0 && !state.writing) stopStreamParse(ctx, 0);
}
function startStreamParse(ctx, current) {
	const state = ctx.state;
	let parsed;
	let failure;
	state.parsing++;
	try {
		parsed = parseSOS(ctx, 0, current);
	} catch (error) {
		failure = { value: error };
	} finally {
		state.parsing--;
		if (!state.alive) releaseParserValues(ctx);
	}
	if (failure) {
		if (state.alive) stopStreamParse(ctx, 1, failure.value);
		else throw failure.value;
	} else if (parsed && state.alive) {
		state.queue.unshift({
			node: parsed,
			initial: true,
			accept: void 0
		});
		drainOutput(ctx);
	}
}
function runCleanups(state) {
	const cleanups = state.cleanups;
	let failure;
	state.cleanups = [];
	for (const record of state.queue) releaseRecord(record);
	state.queue.length = 0;
	if (state.inFlight) releaseRecord(state.inFlight);
	state.inFlight = void 0;
	for (let i = 0, len = cleanups.length; i < len; i++) try {
		cleanups[i]();
	} catch (error) {
		failure ?? (failure = { value: error });
	}
	if (failure) throw failure.value;
}
function releaseRecord(record) {
	record.node = void 0;
	record.accept = void 0;
}
function releaseParserValues(ctx) {
	ctx.base.refs = /* @__PURE__ */ new Map();
	ctx.base.marked.clear();
	ctx.base.plugins = void 0;
	ctx.base.plainObjectPlugins = void 0;
	ctx.state.pluginContexts = [];
	if (ctx.state.parsing === 0) ctx.state.reason = void 0;
}
/**
* Ends the parse once: `onDone` on success, `onError` on failure, and every
* cleanup either way.
*/
function stopStreamParse(ctx, mode, reason) {
	const state = ctx.state;
	if (state.alive) {
		state.alive = false;
		const onError = state.onError;
		const onDone = state.onDone;
		if (mode === 1 && !onError && !(reason instanceof SerovalParserError)) reason = new SerovalParserError(reason);
		state.reason = reason;
		state.onParse = void 0;
		state.onError = void 0;
		state.onDone = void 0;
		state.writing = false;
		state.parsing++;
		let failure;
		try {
			if (mode === 1) {
				if (onError) onError(reason);
				else throw reason;
			} else if (mode === 0) onDone?.();
		} catch (error) {
			failure = { value: error };
		}
		try {
			runCleanups(state);
		} catch (error) {
			failure ?? (failure = { value: error });
		} finally {
			state.parsing--;
			releaseParserValues(ctx);
			state.pending = 0;
		}
		if (failure) throw failure.value;
	}
}
function destroyStreamParse(ctx, reason) {
	stopStreamParse(ctx, 2, reason);
}
async function toCrossJSONAsync(source, options = {}) {
	const plugins = resolvePlugins(options.plugins);
	return await parseTopAsync(createAsyncParserContext({
		compactArrayBufferViews: options.compactArrayBufferViews,
		depthLimit: options.depthLimit,
		plugins,
		disabledFeatures: options.disabledFeatures,
		refs: options.refs
	}), source);
}
function crossSerializeStream(source, options) {
	const plugins = resolvePlugins(options.plugins);
	const onSerialize = options.onSerialize;
	const scopeId = options.scopeId;
	const ctx = createStreamParserContext({
		compactArrayBufferViews: options.compactArrayBufferViews,
		depthLimit: options.depthLimit,
		plugins,
		refs: options.refs,
		disabledFeatures: options.disabledFeatures,
		onParse(node, initial) {
			const serial = createCrossSerializerContext({
				plugins,
				features: ctx.base.features,
				scopeId,
				markedRefs: ctx.base.marked
			});
			return onSerialize(serializeTopCross(serial, node), initial);
		},
		onError: options.onError,
		onDone: options.onDone
	});
	startStreamParse(ctx, source);
	return destroyStreamParse.bind(null, ctx);
}
function toCrossJSONStream(source, options) {
	const plugins = resolvePlugins(options.plugins);
	const ctx = createStreamParserContext({
		compactArrayBufferViews: options.compactArrayBufferViews,
		plugins,
		refs: options.refs,
		disabledFeatures: options.disabledFeatures,
		depthLimit: options.depthLimit,
		onParse: options.onParse,
		onError: options.onError,
		onDone: options.onDone
	});
	startStreamParse(ctx, source);
	return destroyStreamParse.bind(null, ctx);
}
function fromJSON(source, options = {}) {
	const plugins = resolvePlugins(options.plugins);
	const disabledFeatures = options.disabledFeatures ?? 0;
	const sourceFeatures = source.f ?? 127;
	return deserializeTop(createVanillaDeserializerContext({
		depthLimit: options.depthLimit,
		maxBase64Length: options.maxBase64Length,
		plugins,
		markedRefs: source.m,
		features: sourceFeatures & ~disabledFeatures,
		disabledFeatures
	}), source.t);
}
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/makeSerovalPlugin.js
/** Create a Seroval plugin for client/server symmetric (de)serialization. */
/* @__NO_SIDE_EFFECTS__ */
function makeSerovalPlugin(serializationAdapter) {
	return /* @__PURE__ */ createPlugin({
		tag: "$TSR/t/" + serializationAdapter.key,
		test: serializationAdapter.test,
		parse: {
			sync(value, ctx) {
				return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
			},
			async async(value, ctx) {
				return { v: await ctx.parse(serializationAdapter.toSerializable(value)) };
			},
			stream(value, ctx) {
				return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
			}
		},
		serialize: void 0,
		deserialize(node, ctx) {
			return serializationAdapter.fromSerializable(ctx.deserialize(node.v));
		}
	});
}
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/RawStream.js
/**
* Marker class for ReadableStream<Uint8Array> that should be serialized
* with base64/text encoding (JSON and SSR) or binary framing
* (server-function responses).
*
* Wrap your binary streams with this to get efficient serialization:
* ```ts
* // For binary data (files, images, etc.)
* return { data: new RawStream(file.stream()) }
*
* // For text-heavy data (RSC payloads, etc.)
* return { data: new RawStream(rscStream, { hint: 'text' }) }
* ```
*
* RawStreams returned from one server function share one ordered response.
* Arbitrary or sequential consumption can require potentially unbounded client
* buffering for unread data. Cancelling one RawStream discards it locally;
* abort the whole server-function call to cancel the response and server work.
* Consume streams concurrently, cancel unused streams promptly, or use separate
* calls when independent backpressure is required.
*/
var RawStream = class {
	constructor(stream, options) {
		this.stream = stream;
		this.hint = options?.hint ?? "binary";
	}
};
// node_modules/@tanstack/router-core/dist/esm/ssr/headers.js
function toHeadersInstance(init) {
	if (init instanceof Headers) return init;
	else if (Array.isArray(init)) return new Headers(init);
	else if (typeof init === "object") return new Headers(init);
	else return null;
}
function mergeHeaders(...headers) {
	return headers.reduce((acc, header) => {
		const headersInstance = toHeadersInstance(header);
		if (!headersInstance) return acc;
		for (const [key, value] of headersInstance.entries()) if (key === "set-cookie") splitSetCookieString(value).forEach((cookie) => acc.append("set-cookie", cookie));
		else acc.set(key, value);
		return acc;
	}, new Headers());
}
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/ShallowErrorPlugin.js
/**
* this plugin serializes only the `message` part of an Error
* this helps with serializing e.g. a ZodError which has functions attached that cannot be serialized
*/
var ShallowErrorPlugin = /* @__PURE__ */ createPlugin({
	tag: "$TSR/Error",
	test(value) {
		return value instanceof Error;
	},
	parse: {
		sync(value, ctx) {
			return { message: ctx.parse(value.message) };
		},
		async async(value, ctx) {
			return { message: await ctx.parse(value.message) };
		},
		stream(value, ctx) {
			return { message: ctx.parse(value.message) };
		}
	},
	serialize(node, ctx) {
		return "new Error(" + ctx.serialize(node.message) + ")";
	},
	deserialize(node, ctx) {
		return new Error(ctx.deserialize(node.message));
	}
});
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/rawStreamCodec.js
function toBase64(bytes) {
	const chunks = [];
	for (let i = 0; i < bytes.length; i += 32768) chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + 32768)));
	return btoa(chunks.join(""));
}
function fromBase64(value) {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
var textDecoder = /* @__PURE__ */ new TextDecoder("utf-8", {
	fatal: true,
	ignoreBOM: true
});
/** `'t' + utf8` for a valid UTF-8 chunk, otherwise `'b' + base64`. */
function encodeText(value) {
	try {
		return "t" + textDecoder.decode(value);
	} catch {
		return "b" + toBase64(value);
	}
}
var textEncoder$1 = /* @__PURE__ */ new TextEncoder();
function decodeText(value) {
	const data = value.slice(1);
	return value[0] === "t" ? textEncoder$1.encode(data) : fromBase64(data);
}
/**
* Pump a byte stream into a Seroval stream, one encoded chunk per read.
* Returns the Seroval stream and a `stop` function that cancels the reader
* without signalling the Seroval stream; the abort signal and read failures
* stop the pump and throw through the Seroval stream.
*/
function pumpEncodedStream(readable, encode, signal) {
	signal?.throwIfAborted();
	const stream = createStream();
	const reader = readable.getReader();
	let active = true;
	const release = () => {
		active = false;
		signal?.removeEventListener("abort", abort);
		reader.releaseLock();
	};
	const stop = (reason) => {
		if (!active) return false;
		reader.cancel(reason).catch(() => {});
		release();
		return true;
	};
	const abort = () => {
		if (stop(signal.reason)) stream.throw(signal.reason);
	};
	signal?.addEventListener("abort", abort);
	(async () => {
		try {
			while (active) {
				const { done, value } = await reader.read();
				if (!active) return;
				if (done) {
					release();
					stream.return(void 0);
					return;
				}
				stream.next(encode(value));
			}
		} catch (error) {
			if (stop(error)) stream.throw(error);
		}
	})();
	return [stream, stop];
}
/** Rebuild a byte stream from encoded Seroval stream chunks. */
function fromEncodedStream(source, decode) {
	let unsubscribe;
	let done = false;
	return new ReadableStream({
		start(controller) {
			const dispose = source.on({
				next(value) {
					if (done) return;
					try {
						controller.enqueue(decode(value));
					} catch (error) {
						done = true;
						const stop = unsubscribe;
						unsubscribe = void 0;
						stop?.();
						controller.error(error);
					}
				},
				throw(error) {
					if (!done) {
						done = true;
						unsubscribe = void 0;
						controller.error(error);
					}
				},
				return() {
					if (!done) {
						done = true;
						unsubscribe = void 0;
						controller.close();
					}
				}
			});
			if (done) dispose();
			else unsubscribe = dispose;
		},
		cancel() {
			const dispose = unsubscribe;
			unsubscribe = void 0;
			dispose?.();
		}
	});
}
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/RawStreamJSONPlugin.js
/**
* Serializes a RawStream into JSON requests and static-cache responses.
* The optional signal stops the source pump when the request is aborted.
*/
/* @__NO_SIDE_EFFECTS__ */
function createRawStreamJSONPlugin(signal) {
	return /* @__PURE__ */ createPlugin({
		tag: "tss/RawStream",
		test: (value) => value instanceof RawStream,
		parse: { async: async (value, ctx) => {
			const text = await ctx.parse(value.hint === "text");
			const [stream] = pumpEncodedStream(value.stream, value.hint === "text" ? encodeText : toBase64, signal);
			return {
				text,
				stream: await ctx.parse(stream)
			};
		} },
		serialize: void 0,
		deserialize: void 0
	});
}
var RawStreamJSONPlugin = /* @__PURE__ */ createRawStreamJSONPlugin();
/**
* Deserializes the JSON shape above back into a `ReadableStream<Uint8Array>`.
* `test` never matches, so this plugin is inert during serialization and can
* share a plugin list with `RawStreamJSONPlugin`.
*/
var RawStreamJSONDeserializePlugin = /* @__PURE__ */ createPlugin({
	tag: "tss/RawStream",
	test: () => false,
	parse: {},
	serialize: void 0,
	deserialize(node, ctx) {
		return fromEncodedStream(ctx.deserialize(node.stream), ctx.deserialize(node.text) ? decodeText : fromBase64);
	}
});
// node_modules/seroval-plugins/dist/web.js
var READABLE_STREAM_FACTORY = {};
var READABLE_STREAM_FACTORY_CONSTRUCTOR = (stream) => new ReadableStream({ start(controller) {
	stream.on({
		next(value) {
			try {
				controller.enqueue(value);
			} catch (_error) {}
		},
		throw(value) {
			controller.error(value);
		},
		return() {
			try {
				controller.close();
			} catch (_error) {}
		}
	});
} });
var ReadableStreamFactoryPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/ReadableStreamFactory",
	test(value) {
		return value === READABLE_STREAM_FACTORY;
	},
	parse: {
		sync() {
			return READABLE_STREAM_FACTORY;
		},
		async async() {
			return await Promise.resolve(READABLE_STREAM_FACTORY);
		},
		stream() {
			return READABLE_STREAM_FACTORY;
		}
	},
	serialize() {
		return READABLE_STREAM_FACTORY_CONSTRUCTOR.toString();
	},
	deserialize() {
		return READABLE_STREAM_FACTORY;
	}
});
function toAsyncIterable(value) {
	return { [Symbol.asyncIterator]() {
		const reader = value.getReader();
		let active = true;
		let reading = false;
		const release = () => {
			try {
				reader.releaseLock();
			} catch {}
		};
		return {
			async next() {
				if (!active) return {
					done: true,
					value: void 0
				};
				reading = true;
				let result;
				try {
					result = await reader.read();
				} catch (error) {
					reading = false;
					release();
					if (!active) return {
						done: true,
						value: void 0
					};
					active = false;
					throw error;
				}
				reading = false;
				if (!active || result.done) {
					active = false;
					release();
					return {
						done: true,
						value: void 0
					};
				}
				return result;
			},
			return(reason) {
				if (active) {
					active = false;
					try {
						reader.cancel(reason).catch(() => {});
					} catch {}
					if (!reading) release();
				}
				return Promise.resolve({
					done: true,
					value: void 0
				});
			}
		};
	} };
}
var ReadableStreamPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval/plugins/web/ReadableStream",
	extends: [ReadableStreamFactoryPlugin],
	skipPlainObjects: true,
	test(value) {
		if (typeof ReadableStream === "undefined") return false;
		return value instanceof ReadableStream;
	},
	parse: {
		async async(value, ctx) {
			return {
				factory: await ctx.parse(READABLE_STREAM_FACTORY),
				stream: await ctx.parseStreamSource(toAsyncIterable(value))
			};
		},
		stream(value, ctx) {
			return {
				factory: ctx.parse(READABLE_STREAM_FACTORY),
				stream: ctx.parseStreamSource(toAsyncIterable(value))
			};
		}
	},
	serialize(node, ctx) {
		return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.stream) + ")";
	},
	deserialize(node, ctx) {
		return READABLE_STREAM_FACTORY_CONSTRUCTOR(ctx.deserialize(node.stream));
	}
});
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/seroval-plugins.js
/**
* Plugins for JSON transport from a client: serializes RawStream arguments
* and reads plain JSON responses, which never carry RawStream nodes.
*/
/* @__NO_SIDE_EFFECTS__ */
function createDefaultSerovalPlugins(signal) {
	return [
		ShallowErrorPlugin,
		signal ? /* @__PURE__ */ createRawStreamJSONPlugin(signal) : RawStreamJSONPlugin,
		ReadableStreamPlugin
	];
}
/**
* `defaultSerovalPlugins` plus RawStream deserialization, for JSON that may
* carry RawStream nodes: server-function request bodies and cached static
* responses. Seroval deserializes by first tag match, so the deserialize half
* precedes the serialize half; it never matches during serialization.
*/
var defaultSerovalDeserializerPlugins = [RawStreamJSONDeserializePlugin, .../* @__PURE__ */ createDefaultSerovalPlugins()];
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/RawStreamRPCPlugin.js
/**
* Server-side RawStream plugin for multiplexed server-function responses.
* The `hint` is ignored: framed responses always carry raw bytes.
*/
/* @__NO_SIDE_EFFECTS__ */
function createRawStreamRPCPlugin(onRawStream) {
	let nextStreamId = 1;
	return /* @__PURE__ */ createPlugin({
		tag: "tss/RawStream",
		test(value) {
			return value instanceof RawStream;
		},
		parse: { stream(value, ctx) {
			const streamId = nextStreamId++;
			onRawStream(streamId, value.stream);
			return { streamId: ctx.parse(streamId) };
		} },
		serialize: void 0,
		deserialize: void 0
	});
}
// node_modules/@tanstack/router-core/dist/esm/ssr/constants.js
var GLOBAL_TSR = "$_TSR";
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/makeSsrSerovalPlugin.js
/**
* Create a Seroval plugin for server-side serialization only. `tracker.didRun`
* becomes true once the plugin serialized a value.
*/
/* @__NO_SIDE_EFFECTS__ */
function makeSsrSerovalPlugin(serializationAdapter, tracker) {
	return /* @__PURE__ */ createPlugin({
		tag: "$TSR/t/" + serializationAdapter.key,
		test: serializationAdapter.test,
		parse: { stream(value, ctx) {
			return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
		} },
		serialize(node, ctx) {
			if (tracker) tracker.didRun = true;
			return GLOBAL_TSR + ".t.get(\"" + serializationAdapter.key + "\")(" + ctx.serialize(node.v) + ")";
		},
		deserialize: void 0
	});
}
// node_modules/@tanstack/router-core/dist/esm/ssr/tsrScript.js
var tsrScript_default = "self.$_TSR={h(){this.hydrated=!0,this.c()},e(){this.streamEnded=!0,this.c()},c(){this.hydrated&&this.streamEnded&&(delete self.$_TSR,delete self.$R.tsr)},p(e){this.initialized?e():this.buffer.push(e)},buffer:[]}";
// node_modules/@tanstack/router-core/dist/esm/ssr/htmlBoundaryScanner.js
var textEncoder = new TextEncoder();
var DOCUMENT_CLOSE = "</body></html>";
var SCRIPT_CLOSE = "<\/script>";
DOCUMENT_CLOSE.indexOf("y");
SCRIPT_CLOSE.indexOf("p");
textEncoder.encode(DOCUMENT_CLOSE);
textEncoder.encode(SCRIPT_CLOSE);
function encodeIntoBoundedChunk(source, sourceOffset, output, outputOffset = 0) {
	return textEncoder.encodeInto(sourceOffset === 0 ? source : source.slice(sourceOffset), outputOffset === 0 ? output : output.subarray(outputOffset));
}
// node_modules/@tanstack/router-core/dist/esm/ssr/hydrationScripts.js
var encoder = new TextEncoder();
var SOURCE_SEPARATOR = ";";
var MAX_INITIAL_SOURCE_CODE_UNITS = 16384;
var MAX_BACKLOG_CODE_UNITS = 16777216;
var MAX_BACKLOG_SOURCES = 4096;
var MIN_OUTPUT_BYTES = 256;
var MAX_DIRECT_CODE_UNITS = 16384;
var MAX_HYDRATION_OUTPUT_CHUNK_BYTES = 65536;
var MAX_DYNAMIC_RECORD_CODE_UNITS = MAX_HYDRATION_OUTPUT_CHUNK_BYTES;
var STREAM_PART_ATTRIBUTE = "data-tsr-stream-part";
var INITIAL_CLEANUP_SOURCE = `{let s=document.currentScript,p;while((p=s.previousElementSibling)&&p.hasAttribute('${STREAM_PART_ATTRIBUTE}'))p.remove();s.remove()}`;
var INITIAL_CLEANUP_SUFFIX = SOURCE_SEPARATOR + INITIAL_CLEANUP_SOURCE;
var DYNAMIC_CLOSE_SOURCE = "document.currentScript.remove()<\/script>";
var HYDRATION_SCRIPT_BOUNDARY_SOURCE = "document.currentScript.remove();/*$tsr-stream-boundary*/";
var HYDRATION_SCRIPT_BOUNDARY_SUFFIX = ";/*$tsr-stream-boundary*/<\/script>";
HYDRATION_SCRIPT_BOUNDARY_SUFFIX.lastIndexOf("*");
encoder.encode(HYDRATION_SCRIPT_BOUNDARY_SUFFIX);
var ROUTER_PREFIX = GLOBAL_TSR + ".router=";
var PROMISE_PREFIX = GLOBAL_TSR + ".p(()=>";
var DEFAULT_INITIAL_SOURCES = [getCrossReferenceHeader("tsr"), tsrScript_default];
var HydrationScriptOutputState = {
	Waiting: 0,
	Ready: 1,
	Active: 2,
	Done: 3,
	Failed: 4
};
function escapeAttribute(value) {
	return value.replace(/[&"'<>]/g, (char) => `&#${char.charCodeAt(0)};`);
}
function createInitialTags(sources, nonce) {
	const before = [];
	for (const source of sources) {
		if (!source) continue;
		const previous = before[before.length - 1];
		if (previous?.children && previous.children.length + 1 + source.length <= MAX_INITIAL_SOURCE_CODE_UNITS) previous.children += SOURCE_SEPARATOR + source;
		else before.push({
			tag: "script",
			attrs: {
				nonce,
				[STREAM_PART_ATTRIBUTE]: ""
			},
			children: source
		});
	}
	const lastHydrationTag = before[before.length - 1];
	if (lastHydrationTag) {
		const lastSource = lastHydrationTag.children;
		if (lastSource.length + INITIAL_CLEANUP_SUFFIX.length <= MAX_INITIAL_SOURCE_CODE_UNITS) lastHydrationTag.children = lastSource + INITIAL_CLEANUP_SUFFIX;
		else before.push({
			tag: "script",
			attrs: {
				nonce,
				[STREAM_PART_ATTRIBUTE]: ""
			},
			children: INITIAL_CLEANUP_SOURCE
		});
	}
	return {
		before,
		boundary: {
			tag: "script",
			attrs: { nonce },
			children: HYDRATION_SCRIPT_BOUNDARY_SOURCE
		}
	};
}
var HydrationScriptsOwner = class {
	constructor(nonce, initialSources) {
		this.nonce = nonce;
		this.queuedSources = [];
		this.queuedSourceHead = 0;
		this.initialTaken = false;
		this.barrierLifted = false;
		this.producerDone = false;
		this.retainedSources = 0;
		this.regularCodeUnits = 0;
		this.hasOversizedSource = false;
		this.segmentIndex = 0;
		this.closingSegmentIndex = 0;
		this.source = "";
		this.sourceOffset = 0;
		this.outputCapacity = MIN_OUTPUT_BYTES;
		this.outputState = HydrationScriptOutputState.Waiting;
		this.takeInitialHydrationScriptTags = this.takeInitialHydrationScriptTags.bind(this);
		const seedSources = initialSources ?? DEFAULT_INITIAL_SOURCES;
		for (const seedSource of seedSources) {
			if (!this.account(seedSource)) break;
			this.queuedSources.push(seedSource);
		}
	}
	get state() {
		return this.outputState;
	}
	get error() {
		return this.outputError;
	}
	notify() {
		try {
			this.listener?.();
		} catch (listenerError) {
			console.error("Hydration script output listener error:", listenerError);
		}
	}
	refresh(notifyChange = true) {
		const next = this.outputState === HydrationScriptOutputState.Failed ? HydrationScriptOutputState.Failed : this.active ? HydrationScriptOutputState.Active : typeof this.consumer === "object" && this.initialTaken && this.barrierLifted && !this.queueIsEmpty() ? HydrationScriptOutputState.Ready : this.producerDone && this.initialTaken && this.queueIsEmpty() ? HydrationScriptOutputState.Done : HydrationScriptOutputState.Waiting;
		if (this.outputState !== next) {
			this.outputState = next;
			if (notifyChange) this.notify();
		}
	}
	clearTimeoutIfSet() {
		if (this.timeout !== void 0) {
			clearTimeout(this.timeout);
			this.timeout = void 0;
		}
	}
	queueIsEmpty() {
		return this.queuedSourceHead === this.queuedSources.length;
	}
	clearQueue() {
		this.queuedSources = [];
		this.queuedSourceHead = 0;
	}
	dropBufferedOutput() {
		this.clearQueue();
		this.active = void 0;
		this.retainedSources = 0;
		this.regularCodeUnits = 0;
		this.hasOversizedSource = false;
		this.segmentIndex = 0;
		this.closingSegmentIndex = 0;
		this.source = "";
		this.sourceOffset = 0;
		this.outputCapacity = MIN_OUTPUT_BYTES;
		this.opening = void 0;
	}
	fail(reason) {
		if (this.consumer === "cleaned" || this.outputState === HydrationScriptOutputState.Failed) return;
		this.outputError = reason;
		this.clearTimeoutIfSet();
		this.dropBufferedOutput();
		this.outputState = HydrationScriptOutputState.Failed;
		this.notify();
	}
	rejectBacklog(kind) {
		this.fail(/* @__PURE__ */ new Error(`SSR hydration backlog exceeded maximum ${kind} count`));
		return false;
	}
	account(nextSource) {
		if (this.retainedSources === MAX_BACKLOG_SOURCES) return this.rejectBacklog("source-part");
		if (nextSource.length > MAX_BACKLOG_CODE_UNITS) {
			if (this.hasOversizedSource) return this.rejectBacklog("code-unit");
			this.hasOversizedSource = true;
		} else if (this.regularCodeUnits + nextSource.length > MAX_BACKLOG_CODE_UNITS) return this.rejectBacklog("code-unit");
		else this.regularCodeUnits += nextSource.length;
		this.retainedSources++;
		return true;
	}
	releaseSource(part) {
		this.retainedSources--;
		if (part.length > MAX_BACKLOG_CODE_UNITS) this.hasOversizedSource = false;
		else this.regularCodeUnits -= part.length;
	}
	releaseAccounting(batch) {
		for (const part of batch) if (part !== void 0) this.releaseSource(part);
	}
	liftBarrier() {
		if (this.consumer !== "cleaned" && !this.barrierLifted) {
			this.barrierLifted = true;
			this.refresh();
		}
	}
	producerCanWrite() {
		return this.consumer !== "cleaned" && this.outputState !== HydrationScriptOutputState.Failed && !this.producerDone;
	}
	pushSource(nextSource) {
		if (!this.producerCanWrite()) return false;
		if (this.account(nextSource)) {
			this.queuedSources.push(nextSource);
			if (this.initialTaken) this.refresh();
		} else return false;
		return this.producerCanWrite();
	}
	takeQueuedBatch(batchLength) {
		if (this.queuedSourceHead === 0 && batchLength === this.queuedSources.length) {
			const batch = this.queuedSources;
			this.clearQueue();
			return batch;
		}
		const end = this.queuedSourceHead + batchLength;
		const batch = this.queuedSources.slice(this.queuedSourceHead, end);
		for (let index = this.queuedSourceHead; index < end; index++) this.queuedSources[index] = void 0;
		this.queuedSourceHead = end;
		if (this.queueIsEmpty()) this.clearQueue();
		else if (this.queuedSourceHead >= 1024 && this.queuedSourceHead >= this.queuedSources.length - this.queuedSourceHead) {
			this.queuedSources = this.queuedSources.slice(this.queuedSourceHead);
			this.queuedSourceHead = 0;
		}
		return batch;
	}
	release(batch) {
		this.releaseAccounting(batch);
		this.active = void 0;
		this.source = "";
		this.sourceOffset = 0;
		this.refresh(false);
	}
	advanceSource() {
		const batch = this.active;
		if (this.segmentIndex > 0 && this.segmentIndex < this.closingSegmentIndex) {
			const partIndex = this.segmentIndex - 1 >> 1;
			if (this.segmentIndex % 2 === 1) {
				const part = batch[partIndex];
				if (part !== void 0) {
					this.releaseSource(part);
					batch[partIndex] = void 0;
				}
			}
		}
		this.segmentIndex++;
		if (this.segmentIndex < this.closingSegmentIndex) {
			const partIndex = this.segmentIndex - 1 >> 1;
			this.source = this.segmentIndex % 2 === 1 ? batch[partIndex] : SOURCE_SEPARATOR;
		} else if (this.segmentIndex === this.closingSegmentIndex) this.source = DYNAMIC_CLOSE_SOURCE;
		else this.release(batch);
		this.sourceOffset = 0;
	}
	pullActive() {
		const bytes = new Uint8Array(this.outputCapacity);
		let offset = 0;
		while (this.active) if (this.sourceOffset === this.source.length) this.advanceSource();
		else if (offset === bytes.length) break;
		else {
			const result = encodeIntoBoundedChunk(this.source, this.sourceOffset, bytes, offset);
			if (result.read === 0) break;
			this.sourceOffset += result.read;
			offset += result.written;
		}
		if (offset === 0) throw new Error("SSR router script record produced no output");
		if (offset === bytes.length) return bytes;
		return offset * 2 < bytes.length ? bytes.slice(0, offset) : bytes.subarray(0, offset);
	}
	pullReady() {
		const scriptOpening = this.opening ??= this.nonce ? `<script nonce="${escapeAttribute(this.nonce)}">` : "<script>";
		let codeUnits = scriptOpening.length + 40;
		let batchLength = 0;
		for (let index = this.queuedSourceHead; index < this.queuedSources.length; index++) {
			const part = this.queuedSources[index];
			const nextCodeUnits = codeUnits + 1 + part.length;
			if (batchLength > 0 && nextCodeUnits > MAX_DYNAMIC_RECORD_CODE_UNITS) break;
			codeUnits = nextCodeUnits;
			batchLength++;
			if (codeUnits > MAX_DYNAMIC_RECORD_CODE_UNITS) break;
		}
		const batch = this.takeQueuedBatch(batchLength);
		if (codeUnits <= MAX_DIRECT_CODE_UNITS) {
			const joined = batch.length === 1 ? batch[0] : batch.join(SOURCE_SEPARATOR);
			const bytes = encoder.encode(scriptOpening + joined + ";document.currentScript.remove()<\/script>");
			this.release(batch);
			return bytes;
		}
		this.active = batch;
		this.segmentIndex = 0;
		this.closingSegmentIndex = (batch.length << 1) + 1;
		this.source = scriptOpening;
		this.sourceOffset = 0;
		this.outputCapacity = Math.max(MIN_OUTPUT_BYTES, Math.min(MAX_HYDRATION_OUTPUT_CHUNK_BYTES, codeUnits));
		this.outputState = HydrationScriptOutputState.Active;
		return this.pullActive();
	}
	pullChunk() {
		if (this.outputState !== HydrationScriptOutputState.Ready && this.outputState !== HydrationScriptOutputState.Active) throw new Error("Hydration script output is not ready");
		try {
			return this.outputState === HydrationScriptOutputState.Ready ? this.pullReady() : this.pullActive();
		} catch (cause) {
			this.fail(cause);
			throw cause;
		}
	}
	subscribe(onChange) {
		if (this.consumer === "cleaned") return () => {};
		if (this.listener) throw new Error("SSR hydration output already has a subscriber");
		this.listener = onChange;
		return () => {
			if (this.listener === onChange) this.listener = void 0;
		};
	}
	pushSerializedSource(data, initial, wrap) {
		let serialized = initial ? ROUTER_PREFIX + data : data;
		if (wrap) serialized = PROMISE_PREFIX + serialized + ")";
		return this.pushSource(serialized);
	}
	finish() {
		if (!this.pushSource("$_TSR.e()")) return;
		this.producerDone = true;
		this.clearTimeoutIfSet();
		this.refresh();
	}
	takeInitialHydrationScriptTags() {
		if (this.consumer === "cleaned" || this.outputState === HydrationScriptOutputState.Failed || this.initialTaken) return;
		const sources = this.queuedSources;
		const tags = createInitialTags(sources, this.nonce);
		this.initialTaken = true;
		this.releaseAccounting(sources);
		sources.length = 0;
		this.queuedSourceHead = 0;
		this.refresh();
		return tags;
	}
	/**
	* Opt this request out of hydration output entirely (for example a
	* `hydrate: false` page). Drops the queued bootstrap sources, marks the
	* producer done, and makes the fast pass-through path reservable without
	* a rendered `<Scripts>` boundary. Must run before the initial take and
	* before serialization produces output.
	*/
	disableHydration() {
		if (this.consumer === "cleaned" || this.outputState === HydrationScriptOutputState.Failed) return;
		if (this.initialTaken || this.consumer !== void 0 || this.producerDone) invariant();
		this.releaseAccounting(this.queuedSources);
		this.clearQueue();
		this.initialTaken = true;
		this.barrierLifted = true;
		this.producerDone = true;
		this.refresh();
	}
	isInitialTaken() {
		return this.initialTaken;
	}
	skipInitialTake() {
		if (this.consumer !== "cleaned" && !this.initialTaken) {
			this.initialTaken = true;
			this.refresh();
		}
	}
	claimOutput() {
		if (this.consumer === "cleaned") throw new Error("SSR hydration script output is already cleaned up");
		if (this.consumer !== void 0) throw new Error("SSR hydration script output already has a consumer");
		this.consumer = this;
		this.refresh(false);
		return this;
	}
	reserveFastPath(output) {
		const ownsConsumer = this.consumer === output;
		if (this.outputState === HydrationScriptOutputState.Failed || !this.producerDone || !this.initialTaken || !this.queueIsEmpty() || this.active || !ownsConsumer) return false;
		this.consumer = "fast-path";
		return true;
	}
	startSerializationTimeout(timeoutMs) {
		if (this.consumer === "cleaned" || this.outputState === HydrationScriptOutputState.Failed || this.producerDone || this.timeout !== void 0) return;
		this.timeout = setTimeout(() => {
			this.timeout = void 0;
			if (this.consumer !== "cleaned" && this.outputState !== HydrationScriptOutputState.Failed && !this.producerDone) {
				console.error("Serialization timeout after app render finished");
				this.fail(/* @__PURE__ */ new Error("Serialization timeout after app render finished"));
			}
		}, timeoutMs);
	}
	cleanup() {
		if (this.consumer === "cleaned") return;
		this.consumer = "cleaned";
		this.clearTimeoutIfSet();
		this.dropBufferedOutput();
		this.listener = void 0;
		this.outputError = void 0;
		this.producerDone = true;
		this.outputState = HydrationScriptOutputState.Done;
	}
};
/** Create the hydration-script owner for one server request. */
function createHydrationScripts(nonce, initialSources) {
	return new HydrationScriptsOwner(nonce, initialSources);
}
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/RawStreamSSRPlugin.js
var nodeBuffer = globalThis.Buffer;
var toBase64Fast = nodeBuffer ? (bytes) => nodeBuffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64") : toBase64;
var BINARY_FACTORY = () => {};
var TEXT_FACTORY = () => {};
var FACTORY_BINARY = `((s,u=1)=>new ReadableStream({start(c,f){f=s.on({next(b){const d=atob(b),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)},throw(e){s=u=0;c.error(e)},return(){s=u=0;c.close()}});u=u&&f},cancel(){u&&u()}}))`;
var FACTORY_TEXT = `((s,u=1,e=new TextEncoder)=>new ReadableStream({start(c,f){f=s.on({next(v){const x=v.slice(1);if(v[0]==='t')c.enqueue(e.encode(x));else{const d=atob(x),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}},throw(x){s=u=0;c.error(x)},return(){s=u=0;c.close()}});u=u&&f},cancel(){u&&u()}}))`;
function makeFactoryPlugin(tag, sentinel, source) {
	return createPlugin({
		tag,
		test(value) {
			return value === sentinel;
		},
		parse: { stream() {
			return {};
		} },
		serialize() {
			return source;
		},
		deserialize: void 0
	});
}
// node_modules/@tanstack/router-core/dist/esm/ssr/serializer/seroval-plugins.ssr.js
/** Server-only plugins for streaming hydration data into HTML. */
var ssrSerovalPlugins = [
	ShallowErrorPlugin,
	/* @__PURE__ */ createPlugin({
		tag: "tss/RawStream",
		extends: [/* @__PURE__ */ makeFactoryPlugin("tss/RawStreamFactory", BINARY_FACTORY, FACTORY_BINARY), /* @__PURE__ */ makeFactoryPlugin("tss/RawStreamFactoryText", TEXT_FACTORY, FACTORY_TEXT)],
		test(value) {
			return value instanceof RawStream;
		},
		parse: { stream(value, ctx) {
			const text = value.hint === "text";
			const factory = ctx.parse(text ? TEXT_FACTORY : BINARY_FACTORY);
			const [stream, stop] = pumpEncodedStream(value.stream, text ? encodeText : toBase64Fast);
			ctx.addCleanup(stop);
			return {
				factory,
				stream: ctx.parse(stream)
			};
		} },
		serialize(node, ctx) {
			return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.stream) + ")";
		},
		deserialize: void 0
	}),
	ReadableStreamPlugin
];
// node_modules/@tanstack/router-core/dist/esm/ssr/ssr-server.js
function dehydrateMatch(match) {
	const dehydratedMatch = {
		i: dehydrateSsrMatchId(match.id),
		u: match.updatedAt,
		s: match.status
	};
	for (const [key, shorthand] of [
		["__beforeLoadContext", "b"],
		["loaderData", "l"],
		["error", "e"],
		["ssr", "ssr"]
	]) if (match[key] !== void 0) dehydratedMatch[shorthand] = match[key];
	if (match._notFound) dehydratedMatch.g = true;
	return dehydratedMatch;
}
function disposeSerializationSafely(dispose) {
	try {
		dispose?.();
	} catch (err) {
		console.error("Error disposing SSR serialization:", err);
	}
}
function notifyAndClearListeners(listeners, errorMessage, arg) {
	const pending = listeners.slice();
	listeners.length = 0;
	for (const listener of pending) try {
		listener(arg);
	} catch (error) {
		console.error(errorMessage, error);
	}
}
var MANIFEST_CACHE_SIZE = 100;
var manifestCaches = /* @__PURE__ */ new WeakMap();
function getManifestCache(manifest) {
	const cache = manifestCaches.get(manifest);
	if (cache) return cache;
	const newCache = createSieveCache(MANIFEST_CACHE_SIZE);
	manifestCaches.set(manifest, newCache);
	return newCache;
}
function getInlineCssForPreparedRoutes(manifest, preparedRoutes) {
	const styles = manifest.inlineCss?.styles;
	const hrefs = preparedRoutes.inlineCssHrefs;
	if (!styles || !hrefs?.length) return;
	let css = "";
	for (const href of hrefs) css += styles[href];
	return css;
}
function getInlineCssAssetForPreparedRoutes(manifest, preparedRoutes) {
	const css = getInlineCssForPreparedRoutes(manifest, preparedRoutes);
	return css === void 0 ? void 0 : createInlineCssStyleAsset(css);
}
function getMatchedRoutesCacheKey(matches) {
	let cacheKey = "";
	for (let i = 0; i < matches.length; i++) cacheKey += (i === 0 ? "" : "\0") + matches[i].routeId;
	return cacheKey;
}
function getPreparedMatchedManifestRoutes(manifest, matches, cacheKey) {
	{
		const cached = getManifestCache(manifest).get(cacheKey);
		if (cached) return cached;
	}
	const preparedRoutes = prepareMatchedManifestRoutes(manifest, matches);
	getManifestCache(manifest).set(cacheKey, preparedRoutes);
	return preparedRoutes;
}
function prepareMatchedManifestRoutes(manifest, matches) {
	const inlineStyles = manifest.inlineCss?.styles;
	const routes = {};
	if (!inlineStyles) {
		for (const match of matches) {
			const route = manifest.routes[match.routeId];
			if (route) routes[match.routeId] = route;
		}
		return {
			routes,
			hasStrippedRoutes: false
		};
	}
	const inlineCssHrefs = [];
	const seenInlineCssHrefs = /* @__PURE__ */ new Set();
	let hasStrippedRoutes = false;
	for (const match of matches) {
		const routeId = match.routeId;
		const route = manifest.routes[routeId];
		if (!route) continue;
		const nextRoute = stripInlinedStylesheetAssetsFromRoute(inlineStyles, route, inlineCssHrefs, seenInlineCssHrefs);
		if (nextRoute !== route) hasStrippedRoutes = true;
		routes[routeId] = nextRoute;
	}
	return {
		routes,
		hasStrippedRoutes,
		...inlineCssHrefs.length ? { inlineCssHrefs } : {}
	};
}
function stripInlinedStylesheetAssetsFromRoute(inlineStyles, route, inlineCssHrefs, seenInlineCssHrefs) {
	const css = route.css;
	if (!css) return route;
	if (css.length === 0) {
		const nextRoute = { ...route };
		delete nextRoute.css;
		return nextRoute;
	}
	let cssLinks;
	for (let i = 0; i < css.length; i++) {
		const link = css[i];
		const href = getStylesheetHref(link);
		if (inlineStyles[href] === void 0) {
			if (cssLinks) cssLinks.push(link);
			continue;
		}
		if (!seenInlineCssHrefs.has(href)) {
			seenInlineCssHrefs.add(href);
			inlineCssHrefs.push(href);
		}
		if (!cssLinks) cssLinks = css.slice(0, i);
	}
	if (!cssLinks) return route;
	if (cssLinks.length > 0) return {
		...route,
		css: cssLinks
	};
	const nextRoute = { ...route };
	delete nextRoute.css;
	return nextRoute;
}
function hasRouteAssets(route) {
	return !!route.scripts?.length || !!route.css?.length;
}
function hasRequestAssets(assets) {
	return !!assets && (!!assets.preloads?.length || hasRouteAssets(assets));
}
function mergeRequestAssetsIntoRootRoute(rootRoute, requestAssets) {
	const preloads = requestAssets?.preloads?.length ? [...requestAssets.preloads, ...rootRoute?.preloads ?? []] : rootRoute?.preloads;
	const scripts = requestAssets?.scripts?.length ? [...requestAssets.scripts, ...rootRoute?.scripts ?? []] : rootRoute?.scripts;
	const cssLinks = requestAssets?.css?.length ? [...requestAssets.css, ...rootRoute?.css ?? []] : rootRoute?.css;
	return {
		...rootRoute ?? {},
		...preloads?.length ? { preloads } : {},
		...scripts?.length ? { scripts } : {},
		...cssLinks?.length ? { css: cssLinks } : {}
	};
}
/**
* Compose a client-facing manifest from prepared routes, an optional inline
* style, and optional request-scoped assets merged into the root route.
* Shared by the `router.ssr.manifest` getter and `dehydrate()` so the two
* compositions cannot drift.
*/
function composeManifest(scriptFormat, inlineStyle, routes, requestAssets) {
	const base = {
		...scriptFormat ? { scriptFormat } : {},
		...inlineStyle ? { inlineStyle } : {},
		routes
	};
	if (!hasRequestAssets(requestAssets)) return base;
	return {
		...base,
		routes: {
			...routes,
			[rootRouteId]: mergeRequestAssetsIntoRootRoute(routes[rootRouteId], requestAssets)
		}
	};
}
function attachRouterServerSsrUtils({ router, manifest, getRequestAssets }) {
	let memoizedPreparedManifest;
	router.ssr = { get manifest() {
		if (!manifest) return manifest;
		const requestAssets = getRequestAssets?.();
		const hasAssets = hasRequestAssets(requestAssets);
		if (!hasAssets && !manifest.inlineCss) return manifest;
		let inlineCssAsset;
		let routes = manifest.routes;
		if (manifest.inlineCss) {
			const matches = _getRenderedMatches(router.stores.matches.get());
			const cacheKey = getMatchedRoutesCacheKey(matches);
			if (memoizedPreparedManifest?.cacheKey === cacheKey) {
				inlineCssAsset = memoizedPreparedManifest.inlineCssAsset;
				routes = memoizedPreparedManifest.routes;
			} else {
				const preparedManifest = getPreparedMatchedManifestRoutes(manifest, matches, cacheKey);
				inlineCssAsset = getInlineCssAssetForPreparedRoutes(manifest, preparedManifest);
				if (preparedManifest.hasStrippedRoutes) routes = {
					...manifest.routes,
					...preparedManifest.routes
				};
				memoizedPreparedManifest = {
					cacheKey,
					inlineCssAsset,
					routes
				};
			}
		}
		return composeManifest(manifest.scriptFormat, inlineCssAsset, routes, hasAssets ? requestAssets : void 0);
	} };
	let dehydrationPhase = "idle";
	let renderFinished = false;
	const renderFinishedListeners = [];
	const cleanupListeners = [];
	let cleanupStarted = false;
	let settled = false;
	let disposeSerialization;
	const hydrationScripts = createHydrationScripts(router.options.ssr?.nonce);
	const serverSsr = {
		hydrationScripts,
		dehydrate: async (opts) => {
			if (dehydrationPhase !== "idle") invariant();
			opts?.signal?.throwIfAborted();
			dehydrationPhase = "started";
			let matchesToDehydrate = _getRenderedMatches(router.stores.matches.get());
			if (router.isShell()) matchesToDehydrate = matchesToDehydrate.slice(0, 1);
			const matches = matchesToDehydrate.map(dehydrateMatch);
			let manifestToDehydrate = void 0;
			if (manifest) {
				const cacheKey = getMatchedRoutesCacheKey(matchesToDehydrate);
				const preparedManifest = getPreparedMatchedManifestRoutes(manifest, matchesToDehydrate, cacheKey);
				manifestToDehydrate = composeManifest(manifest.scriptFormat, preparedManifest.inlineCssHrefs ? createInlineCssPlaceholderAsset() : void 0, preparedManifest.routes, opts?.requestAssets);
			}
			const dehydratedRouter = {
				manifest: manifestToDehydrate,
				matches
			};
			const dehydrate = router.options.dehydrate;
			const dehydratedData = dehydrate ? opts?.signal ? await waitForReason(dehydrate.call(router.options), opts.signal) : await dehydrate.call(router.options) : void 0;
			opts?.signal?.throwIfAborted();
			if (cleanupStarted) return;
			if (dehydratedData !== void 0) dehydratedRouter.dehydratedData = dehydratedData;
			const trackPlugins = { didRun: false };
			const serializationAdapters = router.options.serializationAdapters;
			const plugins = serializationAdapters ? [...serializationAdapters.map((adapter) => /* @__PURE__ */ makeSsrSerovalPlugin(adapter, trackPlugins)), ...ssrSerovalPlugins] : ssrSerovalPlugins;
			let serializationCompleteSignaled = false;
			let initialSerialized = false;
			const completeScriptSerialization = (result) => {
				if (serializationCompleteSignaled || cleanupStarted) return;
				serializationCompleteSignaled = true;
				const dispose = disposeSerialization;
				disposeSerialization = void 0;
				if (result === true) {
					settled = true;
					hydrationScripts.finish();
				} else if (result) hydrationScripts.fail(result.error);
				if (dispose) queueMicrotask(() => disposeSerializationSafely(dispose));
			};
			let synchronousFailure;
			const dispose = crossSerializeStream(dehydratedRouter, {
				refs: /* @__PURE__ */ new Map(),
				plugins,
				onSerialize: (data, initial) => {
					if (serializationCompleteSignaled || cleanupStarted) return;
					initialSerialized ||= initial;
					if (!hydrationScripts.pushSerializedSource(data, initial, trackPlugins.didRun)) completeScriptSerialization(false);
				},
				onError: (err) => {
					if (serializationCompleteSignaled || cleanupStarted) return;
					console.error("Serialization error:", err);
					synchronousFailure = { error: err };
					completeScriptSerialization({ error: err });
				},
				scopeId: "tsr",
				onDone: () => {
					if (initialSerialized) completeScriptSerialization(true);
				}
			});
			if (cleanupStarted || serializationCompleteSignaled) disposeSerializationSafely(dispose);
			else disposeSerialization = dispose;
			if (synchronousFailure) throw synchronousFailure.error;
		},
		onRenderFinished: (listener) => {
			if (cleanupStarted) return;
			if (renderFinished) {
				try {
					listener();
				} catch (error) {
					console.error("Error in render finished listener:", error);
				}
				return;
			}
			renderFinishedListeners.push(listener);
		},
		onCleanup: (listener) => {
			if (cleanupStarted) {
				try {
					listener(settled);
				} catch (error) {
					console.error("Error in SSR cleanup listener:", error);
				}
				return;
			}
			cleanupListeners.push(listener);
		},
		setRenderFinished: () => {
			if (cleanupStarted || renderFinished) return;
			renderFinished = true;
			hydrationScripts.liftBarrier();
			notifyAndClearListeners(renderFinishedListeners, "Error in render finished listener:", void 0);
		},
		disableHydration: () => {
			if (cleanupStarted || dehydrationPhase === "disabled") return;
			if (dehydrationPhase !== "idle") invariant();
			hydrationScripts.disableHydration();
			dehydrationPhase = "disabled";
		},
		takeInitialHydrationScriptTags: hydrationScripts.takeInitialHydrationScriptTags,
		cleanup() {
			if (cleanupStarted) return;
			cleanupStarted = true;
			hydrationScripts.cleanup();
			const dispose = disposeSerialization;
			disposeSerialization = void 0;
			disposeSerializationSafely(dispose);
			notifyAndClearListeners(cleanupListeners, "Error in SSR cleanup listener:", settled);
			renderFinishedListeners.length = 0;
			router.ssr = void 0;
			router.serverSsr = void 0;
		}
	};
	router.serverSsr = serverSsr;
	for (const listener of router.serverSsrLifecycle?.onServerSsrAttach ?? []) try {
		listener(serverSsr);
	} catch (err) {
		console.error("SSR attach listener error:", err);
	}
}
function getNormalizedURL(url, base) {
	const rawUrl = typeof url === "string" ? new URL(url.replace("\\", "%5C"), base) : url;
	const handledProtocolRelativeURL = rawUrl.pathname.startsWith("//");
	const decodedPathname = decodePath(handledProtocolRelativeURL ? rawUrl.pathname.replace(/^\/+/, "/") : rawUrl.pathname);
	const searchParams = new URLSearchParams(rawUrl.search);
	const normalizedHref = decodedPathname + (searchParams.size > 0 ? "?" : "") + searchParams.toString() + rawUrl.hash;
	return {
		url: new URL(normalizedHref, rawUrl.origin),
		handledProtocolRelativeURL
	};
}
// node_modules/@tanstack/router-core/dist/esm/ssr/handlerCallback.js
function isSsrResponse(value) {
	if (typeof value !== "object" || value === null || !("response" in value) || !(value.response instanceof Response) || !("serverSsrCleanup" in value)) return false;
	if (value.serverSsrCleanup === "none") return true;
	return value.serverSsrCleanup === "stream" && "dispose" in value && typeof value.dispose === "function";
}
function normalizeSsrResponse(result) {
	if (result instanceof Response) return {
		response: result,
		serverSsrCleanup: "none"
	};
	if (isSsrResponse(result)) return result;
	throw new TypeError("Expected a Response from the SSR handler");
}
function cancelResponseBody(response, reason) {
	const body = response.body;
	if (!body) return;
	body.cancel(reason).catch(console.error);
}
function disposeSsrResponse(result, reason) {
	const response = normalizeSsrResponse(result);
	if (response.serverSsrCleanup === "stream") response.dispose(reason);
	else cancelResponseBody(response.response, reason);
}
function bindSsrResponseToRequest(router, result, signal) {
	const ssrResponse = normalizeSsrResponse(result);
	if (ssrResponse.serverSsrCleanup !== "stream") {
		if (signal.aborted) disposeSsrResponse(result, signal.reason);
		return ssrResponse;
	}
	const abort = () => {
		disposeSsrResponse(ssrResponse, signal.reason);
	};
	if (signal.aborted) {
		abort();
		return ssrResponse;
	}
	const serverSsr = router?.serverSsr;
	if (serverSsr?.hydrationScripts.requestSignal === signal) {
		serverSsr.onCleanup(() => {
			if (signal.aborted) abort();
		});
		return ssrResponse;
	}
	signal.addEventListener("abort", abort, { once: true });
	if (!serverSsr) return ssrResponse;
	serverSsr.onCleanup(() => {
		signal.removeEventListener("abort", abort);
	});
	return ssrResponse;
}
function stripSsrResponseBody(result, reason) {
	const ssrResponse = normalizeSsrResponse(result);
	disposeSsrResponse(ssrResponse, reason);
	return {
		response: new Response(null, ssrResponse.response),
		serverSsrCleanup: "none"
	};
}
export { _getRenderedMatches, attachRouterServerSsrUtils, bindSsrResponseToRequest, createRawStreamRPCPlugin, createSerializationAdapter, defaultSerovalDeserializerPlugins, disposeSsrResponse, fromJSON, getNormalizedURL, getScriptPreloadAttrs, getStylesheetHref, invariant, isDangerousProtocol, isNotFound, isPromise, isRedirect, isSsrResponse, makeSerovalPlugin, mergeHeaders, normalizeSsrResponse, parseSetCookie, resolveManifestAssetLink, resolveManifestCssLink, rootRouteId, splitSetCookieString, stripSsrResponseBody, toCrossJSONAsync, toCrossJSONStream, waitForReason };
