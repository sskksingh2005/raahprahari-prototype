globalThis.__nitro_main__ = import.meta.url;
import { H3Core, HTTPError, NodeResponse, composeMiddleware, createMatcherFromFind, defineHandler, defineLazyEventHandler, headers, memoizeRouteRulesMatcher, serve, toEventHandler } from "./_libs/h3+rou3+srvx.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/polyfills/fast-response.mjs
if (globalThis.Response !== NodeResponse) globalThis.Response = NodeResponse;
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/_libs/hookable.mjs
function e$1(t, n, r, i) {
	for (let a = r; a < t.length; a += 1) try {
		let r = i ? i.run(() => t[a](...n)) : t[a](...n);
		if (r && typeof r.then == `function`) return Promise.resolve(r).then(() => e$1(t, n, a + 1, i));
	} catch (e) {
		return Promise.reject(e);
	}
}
var t$1 = class {
	_hooks;
	constructor() {
		this._hooks = {};
	}
	hook(e, t) {
		return !e || typeof t != `function` ? () => {} : (this._hooks[e] = this._hooks[e] || [], this._hooks[e].push(t), () => {
			t &&= (this.removeHook(e, t), void 0);
		});
	}
	removeHook(e, t) {
		let n = this._hooks[e];
		if (n) {
			let r = n.indexOf(t);
			r !== -1 && n.splice(r, 1), n.length === 0 && (this._hooks[e] = void 0);
		}
	}
	callHook(t, ...n) {
		let r = this._hooks[t];
		if (r && r.length !== 0) return e$1(r.slice(), n, 0);
	}
};
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/_libs/ufo.mjs
String.fromCharCode;
var e = /%2f/gi;
function t(e = ``) {
	try {
		return decodeURIComponent(`` + e);
	} catch {
		return `` + e;
	}
}
function n(n) {
	return t(n.replace(e, `%252F`));
}
var r = /\/$|\/\?|\/#/;
var i = /^\.?\//;
function a(e = ``, t) {
	return t ? r.test(e) : e.endsWith(`/`);
}
function o(e = ``, t) {
	if (!t) return (a(e) ? e.slice(0, -1) : e) || `/`;
	if (!a(e, !0)) return e || `/`;
	let n = e, r = ``, i = e.indexOf(`#`);
	i !== -1 && (n = e.slice(0, i), r = e.slice(i));
	let [o, ...s] = n.split(`?`);
	return ((o.endsWith(`/`) ? o.slice(0, -1) : o) || `/`) + (s.length > 0 ? `?${s.join(`?`)}` : ``) + r;
}
function s(e = ``, t) {
	if (!t) return e.endsWith(`/`) ? e : e + `/`;
	if (a(e, !0)) return e || `/`;
	let n = e, r = ``, i = e.indexOf(`#`);
	if (i !== -1 && (n = e.slice(0, i), r = e.slice(i), !n)) return r;
	let [o, ...s] = n.split(`?`);
	return o + `/` + (s.length > 0 ? `?${s.join(`?`)}` : ``) + r;
}
function c(e = ``) {
	return e.startsWith(`/`);
}
function l(e = ``) {
	return c(e) ? e : `/` + e;
}
function u(e) {
	return e && e !== `/`;
}
function d(e, ...t) {
	let n = e || ``;
	for (let e of t.filter((e) => u(e))) if (n) {
		let t = e.replace(i, ``);
		n = s(n) + t;
	} else n = e;
	return n;
}
// #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/apple-touch-icon.png": {
		"type": "image/png",
		"etag": "\"bbfa-wrgkZ2eKRevtdluT5KXVorYimkk\"",
		"mtime": "2026-11-12T11:44:36.839Z",
		"size": 48122,
		"path": "../public/apple-touch-icon.png"
	},
	"/assets/about-DLX3bn4b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18f7-7HjgjIc2ookJjIfYlRpWXh0Jzjg\"",
		"mtime": "2026-11-27T07:15:42.716Z",
		"size": 6391,
		"path": "../public/assets/about-DLX3bn4b.js"
	},
	"/assets/account-session-E8yhq6-D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"627-82Z30Ud5IM5v3pHNSPjG+snTarc\"",
		"mtime": "2026-11-27T07:15:42.716Z",
		"size": 1575,
		"path": "../public/assets/account-session-E8yhq6-D.js"
	},
	"/assets/advisories._segmentId-5M2RWe6N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d17-ExYDih3caXk/DC0VKfiUHWkNBOc\"",
		"mtime": "2026-11-27T07:15:42.716Z",
		"size": 19735,
		"path": "../public/assets/advisories._segmentId-5M2RWe6N.js"
	},
	"/assets/advisories._segmentId-B4hP-5XH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9ed-2nZe5rsw+4g6G/Y7SolqfdBiitE\"",
		"mtime": "2026-11-27T07:15:42.719Z",
		"size": 2541,
		"path": "../public/assets/advisories._segmentId-B4hP-5XH.js"
	},
	"/assets/advisories._segmentId-C7LLT6om.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c74-OBcXYXm3nSXAxtmZES862MJj5rQ\"",
		"mtime": "2026-11-27T07:15:42.719Z",
		"size": 3188,
		"path": "../public/assets/advisories._segmentId-C7LLT6om.js"
	},
	"/assets/advisories.index-DOLVWUUl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c20-VC869xMuJdyOfCtxU/Ybqyh8xUU\"",
		"mtime": "2026-11-27T07:15:42.720Z",
		"size": 3104,
		"path": "../public/assets/advisories.index-DOLVWUUl.js"
	},
	"/assets/advisory-card-BQpRqUNg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1372-jbOP5LcjRF7f1M0BZ0twlSZGCUc\"",
		"mtime": "2026-11-27T07:15:42.720Z",
		"size": 4978,
		"path": "../public/assets/advisory-card-BQpRqUNg.js"
	},
	"/assets/auth-pages-qvS-UbgK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8ae-A6+l8CnFb+VT/0WdcUxO7JBBgGY\"",
		"mtime": "2026-11-27T07:15:42.720Z",
		"size": 2222,
		"path": "../public/assets/auth-pages-qvS-UbgK.js"
	},
	"/assets/auth.callback-DZ2YSZlP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"178-4CoqtvHli+CIcdLEUzRs3ilzd1E\"",
		"mtime": "2026-11-27T07:15:42.720Z",
		"size": 376,
		"path": "../public/assets/auth.callback-DZ2YSZlP.js"
	},
	"/assets/auth.reset-password-cggRyDFR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c-otoUn9e9sLwqidX2HQjhnZjHrQk\"",
		"mtime": "2026-11-27T07:15:42.722Z",
		"size": 76,
		"path": "../public/assets/auth.reset-password-cggRyDFR.js"
	},
	"/assets/button-oRKDJcOt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"be4-3B/tDo9JucpEzX8y22ir3uX86ZY\"",
		"mtime": "2026-11-27T07:15:42.722Z",
		"size": 3044,
		"path": "../public/assets/button-oRKDJcOt.js"
	},
	"/assets/camera-CoJWegJc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"174-D7VgiFnBhVL2w5J3/6hPauul+k4\"",
		"mtime": "2026-11-27T07:15:42.722Z",
		"size": 372,
		"path": "../public/assets/camera-CoJWegJc.js"
	},
	"/assets/check-BPrKDD9Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a0-ImLSgEm4dePNf7AXM/zqCyDKwq4\"",
		"mtime": "2026-11-27T07:15:42.722Z",
		"size": 160,
		"path": "../public/assets/check-BPrKDD9Y.js"
	},
	"/assets/check-CPaMQS-c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"67d3-q9MmuOeeAO8GgPqV1JXYXAGmzmE\"",
		"mtime": "2026-11-27T07:15:42.724Z",
		"size": 26579,
		"path": "../public/assets/check-CPaMQS-c.js"
	},
	"/assets/checkbox-CI0u1OCi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13ee-3CEqaD6Z6Sis8IfE8aJSmsmvqYA\"",
		"mtime": "2026-11-27T07:15:42.724Z",
		"size": 5102,
		"path": "../public/assets/checkbox-CI0u1OCi.js"
	},
	"/assets/chevron-right-CgWAC0LJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a6-xJNnoOMKOIuqMzNrDINvSzCmuws\"",
		"mtime": "2026-11-27T07:15:42.724Z",
		"size": 166,
		"path": "../public/assets/chevron-right-CgWAC0LJ.js"
	},
	"/assets/circle-alert-CpkjT6UB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"137-odPsfCa/LfYXNaNpnjO2mboTvdQ\"",
		"mtime": "2026-11-27T07:15:42.726Z",
		"size": 311,
		"path": "../public/assets/circle-alert-CpkjT6UB.js"
	},
	"/assets/circle-check-CitmE6Ne.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6-ZwY+fU1l6XJVRxMepdZIAKk2bl4\"",
		"mtime": "2026-11-27T07:15:42.726Z",
		"size": 246,
		"path": "../public/assets/circle-check-CitmE6Ne.js"
	},
	"/assets/circle-question-mark-BK_hvZKS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"142-9XyFw3LCrCdB/wza6ERV5gj24BU\"",
		"mtime": "2026-11-27T07:15:42.726Z",
		"size": 322,
		"path": "../public/assets/circle-question-mark-BK_hvZKS.js"
	},
	"/assets/clock-3-CeuxWHj_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cd-3pVBXRDINdNDGoj5Z1aUQChcFk4\"",
		"mtime": "2026-11-27T07:15:42.726Z",
		"size": 205,
		"path": "../public/assets/clock-3-CeuxWHj_.js"
	},
	"/assets/clock-BzLXTv_8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cd-vlMdRtu/jAxod+Jh/PT+5GC3QzA\"",
		"mtime": "2026-11-27T07:15:42.727Z",
		"size": 205,
		"path": "../public/assets/clock-BzLXTv_8.js"
	},
	"/assets/contact-CNINsr-K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102f-qB5yUyr1Tv49R/0kATk1yjkTeYg\"",
		"mtime": "2026-11-27T07:15:42.727Z",
		"size": 4143,
		"path": "../public/assets/contact-CNINsr-K.js"
	},
	"/assets/contributions-DRBgdw30.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6b54-mzCVb2AAck+Krv/b13bKV2ehwmM\"",
		"mtime": "2026-11-27T07:15:42.728Z",
		"size": 27476,
		"path": "../public/assets/contributions-DRBgdw30.js"
	},
	"/assets/copy-C-1FTUll.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"110-RGxVPR8pGSi4OfRUJ/m3BfJTS2I\"",
		"mtime": "2026-11-27T07:15:42.728Z",
		"size": 272,
		"path": "../public/assets/copy-C-1FTUll.js"
	},
	"/assets/dist-C7b_MVpr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d83-RdVg8Q5TSJmMHwC5FpwKUnIXqAc\"",
		"mtime": "2026-11-27T07:15:42.728Z",
		"size": 7555,
		"path": "../public/assets/dist-C7b_MVpr.js"
	},
	"/assets/dist-DjSK2MGE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30b-WENy6ox+Nn9QKi84gPEWpYqznW0\"",
		"mtime": "2026-11-27T07:15:42.730Z",
		"size": 779,
		"path": "../public/assets/dist-DjSK2MGE.js"
	},
	"/assets/dist-Tay0JV5y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6a-HN8nSt+GQnvSJwzRa8WlR48F2ZA\"",
		"mtime": "2026-11-27T07:15:42.730Z",
		"size": 3178,
		"path": "../public/assets/dist-Tay0JV5y.js"
	},
	"/assets/dist-w-2RAbho.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8327-kIGeMb5qfU8UULInosI6KgML3lQ\"",
		"mtime": "2026-11-27T07:15:42.731Z",
		"size": 33575,
		"path": "../public/assets/dist-w-2RAbho.js"
	},
	"/assets/draft-repository-Cr5Bcoge.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bcf3-Bd0I2nXtMyX1U6tSys+6IQYOvDs\"",
		"mtime": "2026-11-27T07:15:42.732Z",
		"size": 113907,
		"path": "../public/assets/draft-repository-Cr5Bcoge.js"
	},
	"/assets/field-CS_2M3i2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"798-yGWQy1hFthfAFuBJzyfht5RYsNk\"",
		"mtime": "2026-11-27T07:15:42.732Z",
		"size": 1944,
		"path": "../public/assets/field-CS_2M3i2.js"
	},
	"/assets/file-text-OOEADu2e.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a5-iq4triS5LTYb4bn44KOZY5NfDmM\"",
		"mtime": "2026-11-27T07:15:42.733Z",
		"size": 421,
		"path": "../public/assets/file-text-OOEADu2e.js"
	},
	"/assets/flask-conical-lZS0Sfhr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"152-/5BDHE5C7hOX8dNxZg6yks8p39E\"",
		"mtime": "2026-11-27T07:15:42.734Z",
		"size": 338,
		"path": "../public/assets/flask-conical-lZS0Sfhr.js"
	},
	"/assets/geo-Dck7R8RE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6b3-yANMTPgx8uMaSOYEVk5vlP+0MiM\"",
		"mtime": "2026-11-27T07:15:42.734Z",
		"size": 1715,
		"path": "../public/assets/geo-Dck7R8RE.js"
	},
	"/assets/help-DeigDCmp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1087-JZLrLM+BDp/LASM3qauk9osqNCA\"",
		"mtime": "2026-11-27T07:15:42.735Z",
		"size": 4231,
		"path": "../public/assets/help-DeigDCmp.js"
	},
	"/assets/help._topic-C3LGqXel.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5c5-BfcBHM3qxjs9wwcsoR/PNTAEqFc\"",
		"mtime": "2026-11-27T07:15:42.736Z",
		"size": 1477,
		"path": "../public/assets/help._topic-C3LGqXel.js"
	},
	"/assets/index-CU96Ivos.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"2ed32-n76F3+GpqmjFPrax9dLUdhApq18\"",
		"mtime": "2026-11-27T07:15:42.770Z",
		"size": 191794,
		"path": "../public/assets/index-CU96Ivos.css"
	},
	"/assets/index-DnFWZYe5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7eb41-Ap4DdBDwk83E0fIJ/TDTNCxI6vE\"",
		"mtime": "2026-11-27T07:15:42.716Z",
		"size": 518977,
		"path": "../public/assets/index-DnFWZYe5.js"
	},
	"/assets/input-9vC0lOx_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3c4-xzY0sGLfnswo7I8lwE6GDjbDWvM\"",
		"mtime": "2026-11-27T07:15:42.736Z",
		"size": 964,
		"path": "../public/assets/input-9vC0lOx_.js"
	},
	"/assets/jsx-runtime-dC67yryO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b3-ZR6pwv6mBwOnLEdfvKM0M7bqFX8\"",
		"mtime": "2026-11-27T07:15:42.737Z",
		"size": 435,
		"path": "../public/assets/jsx-runtime-dC67yryO.js"
	},
	"/assets/lazyRouteComponent-wnr7Usxr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e9b-RoXfral0+g7vJ8kekPaAEGB1kQU\"",
		"mtime": "2026-11-27T07:15:42.738Z",
		"size": 3739,
		"path": "../public/assets/lazyRouteComponent-wnr7Usxr.js"
	},
	"/assets/leaflet-segment-map-3tNWFNss.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"4adb-vzNfU5auchg9PJNTaDa1BsjEUQk\"",
		"mtime": "2026-11-27T07:15:42.771Z",
		"size": 19163,
		"path": "../public/assets/leaflet-segment-map-3tNWFNss.css"
	},
	"/assets/leaflet-segment-map-D9m5xVzG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"265c-6Vr2uQJwuKBU+wrDnNUpfKRVQ+g\"",
		"mtime": "2026-11-27T07:15:42.738Z",
		"size": 9820,
		"path": "../public/assets/leaflet-segment-map-D9m5xVzG.js"
	},
	"/assets/leaflet-src-DoC2Zuse.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24485-W6sKxuVCYX7kYPzDu7Ki76JXYyY\"",
		"mtime": "2026-11-27T07:15:42.739Z",
		"size": 148613,
		"path": "../public/assets/leaflet-src-DoC2Zuse.js"
	},
	"/assets/link-2-DwnFyw6J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"116-14Vrw/+PuGNI4IYExmIL9U75tGk\"",
		"mtime": "2026-11-27T07:15:42.739Z",
		"size": 278,
		"path": "../public/assets/link-2-DwnFyw6J.js"
	},
	"/assets/link-CZDj-w7z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1066-XNzqqvnkzXLykNxI/m1tn8UBrWk\"",
		"mtime": "2026-11-27T07:15:42.740Z",
		"size": 4198,
		"path": "../public/assets/link-CZDj-w7z.js"
	},
	"/assets/list-Bq9Rjy8F.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"152-nnHY0SwI9xVCcZz2ZDIF11Nt3C8\"",
		"mtime": "2026-11-27T07:15:42.741Z",
		"size": 338,
		"path": "../public/assets/list-Bq9Rjy8F.js"
	},
	"/assets/loader-circle-DPxIKbLO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c9-U0GpJgeFywRXyj4b0Kj5SeQzRGM\"",
		"mtime": "2026-11-27T07:15:42.742Z",
		"size": 201,
		"path": "../public/assets/loader-circle-DPxIKbLO.js"
	},
	"/assets/lock-keyhole-DIQWaY8n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"123-cfKIO4SP2tuy1mxxvlEK5XCmxXQ\"",
		"mtime": "2026-11-27T07:15:42.744Z",
		"size": 291,
		"path": "../public/assets/lock-keyhole-DIQWaY8n.js"
	},
	"/assets/map-pin-LVqy7O1I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-QVqVJyUqtoxhPLcilTR7OjqirjA\"",
		"mtime": "2026-11-27T07:15:42.744Z",
		"size": 295,
		"path": "../public/assets/map-pin-LVqy7O1I.js"
	},
	"/assets/map-sflj-cXw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"130d-rT90KH0d9K43xV+rytvCos7VUpc\"",
		"mtime": "2026-11-27T07:15:42.744Z",
		"size": 4877,
		"path": "../public/assets/map-sflj-cXw.js"
	},
	"/assets/matchContext-Cyy9OvJg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e8b0-L0GE1g8L/DOMMaFMetiruOH2ZmU\"",
		"mtime": "2026-11-27T07:15:42.745Z",
		"size": 59568,
		"path": "../public/assets/matchContext-Cyy9OvJg.js"
	},
	"/assets/mountain-Cs-WKP_f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ac-dng3d7CZUybg7n4Pn+hEVxQc5Zo\"",
		"mtime": "2026-11-27T07:15:42.745Z",
		"size": 172,
		"path": "../public/assets/mountain-Cs-WKP_f.js"
	},
	"/assets/official-DbcqjpsW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e48-MW1gD7CMYwDwFjeDZV4sct655a8\"",
		"mtime": "2026-11-27T07:15:42.746Z",
		"size": 11848,
		"path": "../public/assets/official-DbcqjpsW.js"
	},
	"/assets/page-banner-BnTWYWxi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"229-VW9EiPUD9JQg8qtG5YgFwyuDUIo\"",
		"mtime": "2026-11-27T07:15:42.746Z",
		"size": 553,
		"path": "../public/assets/page-banner-BnTWYWxi.js"
	},
	"/assets/preferences-CmGgIc76.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"393ab-j/wut11tU3mfM/+XLy0REsXzMD4\"",
		"mtime": "2026-11-27T07:15:42.747Z",
		"size": 234411,
		"path": "../public/assets/preferences-CmGgIc76.js"
	},
	"/assets/profile-CONAWzI6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cff-07NplWKyCTpCbl0QaVzek5BaXV0\"",
		"mtime": "2026-11-27T07:15:42.748Z",
		"size": 3327,
		"path": "../public/assets/profile-CONAWzI6.js"
	},
	"/assets/radio-group-CBqM1mnh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19bb-HuY50bQ1aqlhIA5JYtj1KzIQVmw\"",
		"mtime": "2026-11-27T07:15:42.748Z",
		"size": 6587,
		"path": "../public/assets/radio-group-CBqM1mnh.js"
	},
	"/assets/react-DXWzCIQQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ec4-h9ge3HFdu9m+GzWAlxuwt4a/zlw\"",
		"mtime": "2026-11-27T07:15:42.749Z",
		"size": 7876,
		"path": "../public/assets/react-DXWzCIQQ.js"
	},
	"/assets/react-dom-CNbkTeJk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f39-QlmL6+n2pX4p2LKFzGXSoK3omBs\"",
		"mtime": "2026-11-27T07:15:42.750Z",
		"size": 3897,
		"path": "../public/assets/react-dom-CNbkTeJk.js"
	},
	"/assets/receipt-stub-SS73BTQ7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c04-pg73DwPCnRTt/+ZwOxa2/sLZTFE\"",
		"mtime": "2026-11-27T07:15:42.750Z",
		"size": 3076,
		"path": "../public/assets/receipt-stub-SS73BTQ7.js"
	},
	"/assets/report-DcF8eka4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9b-aQPBQg0YIio1MjOslyzn6MIJjvE\"",
		"mtime": "2026-11-27T07:15:42.751Z",
		"size": 155,
		"path": "../public/assets/report-DcF8eka4.js"
	},
	"/assets/report-step-page-Bd4Vm64S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2061b-O38WmTOVYZCdzT/6MkUmwQPbNO8\"",
		"mtime": "2026-11-27T07:15:42.751Z",
		"size": 132635,
		"path": "../public/assets/report-step-page-Bd4Vm64S.js"
	},
	"/assets/report-store-CBuRvcyV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18012-nRdj4g9A2rCbw7fFJ6uWPnl3O6Y\"",
		"mtime": "2026-11-27T07:15:42.752Z",
		"size": 98322,
		"path": "../public/assets/report-store-CBuRvcyV.js"
	},
	"/assets/report.index-C3OVyxPq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17e-gPnIVDXcqW6WCirVhoK/7jyjt7U\"",
		"mtime": "2026-11-27T07:15:42.753Z",
		"size": 382,
		"path": "../public/assets/report.index-C3OVyxPq.js"
	},
	"/assets/report.location-Bo6EjncP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"126-QSmc7TMmH4z2DpZPsHrQMGNVGtQ\"",
		"mtime": "2026-11-27T07:15:42.753Z",
		"size": 294,
		"path": "../public/assets/report.location-Bo6EjncP.js"
	},
	"/assets/report.photo-Db-PiU0I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"123-glKYquCq0Murqp33fCZrbUttC0o\"",
		"mtime": "2026-11-27T07:15:42.754Z",
		"size": 291,
		"path": "../public/assets/report.photo-Db-PiU0I.js"
	},
	"/assets/report.received-CJ2Q80-n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"126-tiwhiTP1UlY/0jAZocxjlNzNQWs\"",
		"mtime": "2026-11-27T07:15:42.754Z",
		"size": 294,
		"path": "../public/assets/report.received-CJ2Q80-n.js"
	},
	"/assets/report.review-DfqasH0r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"124-8Kv9m8Kiot0uzwCoVrLBu3f+ttE\"",
		"mtime": "2026-11-27T07:15:42.755Z",
		"size": 292,
		"path": "../public/assets/report.review-DfqasH0r.js"
	},
	"/assets/reports.index-BmMa-msT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a7d-3TVptPHaLzz/SJbRtjngXVp1T+U\"",
		"mtime": "2026-11-27T07:15:42.755Z",
		"size": 2685,
		"path": "../public/assets/reports.index-BmMa-msT.js"
	},
	"/assets/review._ref-BxRChCJj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"42ba-6ip4RTHsSj6CozqKoiVoI21Gb28\"",
		"mtime": "2026-11-27T07:15:42.756Z",
		"size": 17082,
		"path": "../public/assets/review._ref-BxRChCJj.js"
	},
	"/assets/review.index-B7jC1DCW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e11-r+SyfkQHhaPlbfwVPK3zRNvIKB4\"",
		"mtime": "2026-11-27T07:15:42.756Z",
		"size": 7697,
		"path": "../public/assets/review.index-B7jC1DCW.js"
	},
	"/assets/rolldown-runtime-pP25SEvz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3dd-psIYEjeZYAgQcPTEhLRt5UuDOt4\"",
		"mtime": "2026-11-27T07:15:42.757Z",
		"size": 989,
		"path": "../public/assets/rolldown-runtime-pP25SEvz.js"
	},
	"/assets/rotate-ccw-RHVUbYSS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ec-zI3wJ32l7G/CHF+GHxEPh+8Wcyg\"",
		"mtime": "2026-11-27T07:15:42.758Z",
		"size": 236,
		"path": "../public/assets/rotate-ccw-RHVUbYSS.js"
	},
	"/assets/route-D4TaV-RP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"122-A2agt+WqfXD8a1TNct0D5xZR8bg\"",
		"mtime": "2026-11-27T07:15:42.760Z",
		"size": 290,
		"path": "../public/assets/route-D4TaV-RP.js"
	},
	"/assets/routes-BK0pY3df.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dbe-cUHJJRjD7/lTy4Scj23044aRv20\"",
		"mtime": "2026-11-27T07:15:42.761Z",
		"size": 3518,
		"path": "../public/assets/routes-BK0pY3df.js"
	},
	"/assets/segment-detail-gNRXP-Yc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"435e-CHz8Hm5zU/0tdMehlLYFOPUiFuA\"",
		"mtime": "2026-11-27T07:15:42.761Z",
		"size": 17246,
		"path": "../public/assets/segment-detail-gNRXP-Yc.js"
	},
	"/assets/skeleton-TclCwmLe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d7-+rRCagXH/7Tz7kBfO/iwnDPdFGk\"",
		"mtime": "2026-11-27T07:15:42.761Z",
		"size": 983,
		"path": "../public/assets/skeleton-TclCwmLe.js"
	},
	"/assets/status-CTVaQC9Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b01-7yZxZJVgi50rk5UQbGXuUsNuBcU\"",
		"mtime": "2026-11-27T07:15:42.761Z",
		"size": 11009,
		"path": "../public/assets/status-CTVaQC9Y.js"
	},
	"/assets/supabase-RZWvYarm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"35265-LCknhcZZsJ9c9WV7iD7Gbat3Gwg\"",
		"mtime": "2026-11-27T07:15:42.763Z",
		"size": 217701,
		"path": "../public/assets/supabase-RZWvYarm.js"
	},
	"/assets/tabs-CarMccUt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1531-xW/Bd+NG8kaPZTMvIYei7Z97u7g\"",
		"mtime": "2026-11-27T07:15:42.764Z",
		"size": 5425,
		"path": "../public/assets/tabs-CarMccUt.js"
	},
	"/assets/textarea-C1XTSxSJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"307-q0VG0JbpF68jdy8qsMTe87iT2BU\"",
		"mtime": "2026-11-27T07:15:42.764Z",
		"size": 775,
		"path": "../public/assets/textarea-C1XTSxSJ.js"
	},
	"/assets/traveller-CGP8omax.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"46c7-Z2ubvI5nD10iVOWZReqcdpAFwA0\"",
		"mtime": "2026-11-27T07:15:42.764Z",
		"size": 18119,
		"path": "../public/assets/traveller-CGP8omax.js"
	},
	"/assets/tslib.es6-Tae09705.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"42d-qJHuGuq51+EbLaebsBAkbj1JLbk\"",
		"mtime": "2026-11-27T07:15:42.766Z",
		"size": 1069,
		"path": "../public/assets/tslib.es6-Tae09705.js"
	},
	"/assets/use-review-claims-CkA8Px3F.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c4f-B1cmJ+1VtE+WgUR+aTvphRBlu/w\"",
		"mtime": "2026-11-27T07:15:42.766Z",
		"size": 3151,
		"path": "../public/assets/use-review-claims-CkA8Px3F.js"
	},
	"/assets/use-screen-state-Bvsgfrer.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cb-36JEr27srbQQeWIK+RkYpFS7Dik\"",
		"mtime": "2026-11-27T07:15:42.767Z",
		"size": 459,
		"path": "../public/assets/use-screen-state-Bvsgfrer.js"
	},
	"/assets/useMatch-C5z1oXiQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23c-F3p4tXLJlTTo3dYHyCcle6SmkU0\"",
		"mtime": "2026-11-27T07:15:42.767Z",
		"size": 572,
		"path": "../public/assets/useMatch-C5z1oXiQ.js"
	},
	"/assets/useNavigate-B12D_bmu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"108-5qO2uKI0m/qSiBLYRjQRr7k/LSY\"",
		"mtime": "2026-11-27T07:15:42.767Z",
		"size": 264,
		"path": "../public/assets/useNavigate-B12D_bmu.js"
	},
	"/assets/useSelector-3h0Qf9pd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"781-k58ha/hd6SBcUIV9SOebJydyeZ0\"",
		"mtime": "2026-11-27T07:15:42.768Z",
		"size": 1921,
		"path": "../public/assets/useSelector-3h0Qf9pd.js"
	},
	"/assets/users-round-CaQGcpw7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135-NQeIZRhIYw7pkMkA5wtMbEKxllE\"",
		"mtime": "2026-11-27T07:15:42.768Z",
		"size": 309,
		"path": "../public/assets/users-round-CaQGcpw7.js"
	},
	"/assets/utils-D0T3A-kS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6bac-lbrR5Uk7MwXv0bw3OHvsnKy1L+Y\"",
		"mtime": "2026-11-27T07:15:42.768Z",
		"size": 27564,
		"path": "../public/assets/utils-D0T3A-kS.js"
	},
	"/assets/x-C71rUXLp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"be-lnFCUVUkkIab3ilp0dT1kIboQns\"",
		"mtime": "2026-11-27T07:15:42.770Z",
		"size": 190,
		"path": "../public/assets/x-C71rUXLp.js"
	},
	"/favicon-32.png": {
		"type": "image/png",
		"etag": "\"b22-thb6965UerdqJqAPDm6wpuU/iGQ\"",
		"mtime": "2026-11-12T11:44:36.841Z",
		"size": 2850,
		"path": "../public/favicon-32.png"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"15ad-94giehOj6d07NT+mGnbpLzYv3/E\"",
		"mtime": "2026-11-12T11:44:36.842Z",
		"size": 5549,
		"path": "../public/favicon.ico"
	},
	"/icon-192.png": {
		"type": "image/png",
		"etag": "\"d27b-MchXS5EtSOHbfKmQzoV+OWVvn1g\"",
		"mtime": "2026-11-12T11:44:36.843Z",
		"size": 53883,
		"path": "../public/icon-192.png"
	},
	"/icon-512.png": {
		"type": "image/png",
		"etag": "\"48142-K1Y7XqVlj54xIb2z1HQRrSMKv4c\"",
		"mtime": "2026-11-12T11:44:36.843Z",
		"size": 295234,
		"path": "../public/icon-512.png"
	},
	"/img/banner-strip.png": {
		"type": "image/png",
		"etag": "\"1d9721-DPRwNzpNQhjVrqhaSRYwS9Rm4mo\"",
		"mtime": "2026-11-07T07:24:32.647Z",
		"size": 1939233,
		"path": "../public/img/banner-strip.png"
	},
	"/img/hero-mountain.png": {
		"type": "image/png",
		"etag": "\"26e396-2NuQZgljU3wbcoluSdWrekuiFeY\"",
		"mtime": "2026-11-07T07:24:32.673Z",
		"size": 2548630,
		"path": "../public/img/hero-mountain.png"
	},
	"/img/hero-road.png": {
		"type": "image/png",
		"etag": "\"18cad3-IO0u+6g+myp1O/gBdVys992/JWM\"",
		"mtime": "2026-11-07T07:24:32.692Z",
		"size": 1624787,
		"path": "../public/img/hero-road.png"
	},
	"/img/logo-on-dark.png": {
		"type": "image/png",
		"etag": "\"4a537-uBpbFs5ubcpGGjBcLOT8u3On5lg\"",
		"mtime": "2026-11-12T11:44:36.843Z",
		"size": 304439,
		"path": "../public/img/logo-on-dark.png"
	},
	"/img/logo-on-light.png": {
		"type": "image/png",
		"etag": "\"57d82-FV1txC3luf74km8rPGOLPETF8yY\"",
		"mtime": "2026-11-12T11:44:36.843Z",
		"size": 359810,
		"path": "../public/img/logo-on-light.png"
	},
	"/img/map-terrain.png": {
		"type": "image/png",
		"etag": "\"2cab0b-xuw44Msooh4eqX3KhuaZAA2GFVA\"",
		"mtime": "2026-11-07T07:24:32.716Z",
		"size": 2927371,
		"path": "../public/img/map-terrain.png"
	},
	"/manifest.webmanifest": {
		"type": "application/manifest+json",
		"etag": "\"224-gy/9GTS0Fpk8aIH6dC2wd5Hxdv4\"",
		"mtime": "2026-11-12T11:44:36.843Z",
		"size": 548,
		"path": "../public/manifest.webmanifest"
	}
};
// #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path)).catch((error) => {
		if (error?.code !== "ENOENT") throw error;
	});
}
// #nitro/virtual/public-assets
var publicAssetBases = { "/assets/": { "maxAge": 31536e3 } };
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
function hasAsset(id = "") {
	return !!(public_assets_data_default[id] || public_assets_data_default[id + ".gz"] || public_assets_data_default[id + ".br"] || public_assets_data_default[id + ".zst"]);
}
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var noCacheHeaders = { "cache-control": "no-store" };
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	const path = l(o(event.url.pathname));
	let id = path.includes("%") ? n(path) : path;
	if (!hasAsset(id) && !hasAsset(d(id, "index.html")) && !isPublicAssetURL(id)) return;
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((entry) => {
		const [name, ...parameters] = entry.split(";");
		const quality = parameters.map((parameter) => parameter.trim().split("=")).find(([key]) => key.toLowerCase() === "q")?.[1];
		const weight = quality === void 0 ? 1 : Number.parseFloat(quality);
		return {
			ext: EncodingMap[name.trim().toLowerCase()],
			weight: Number.isNaN(weight) ? 1 : weight
		};
	}).filter((entry) => entry.ext && entry.weight > 0).sort((a, b) => b.weight - a.weight || (a.ext < b.ext ? -1 : a.ext > b.ext ? 1 : 0)).map((entry) => entry.ext), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, d(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) throw new HTTPError({
			status: 404,
			headers: noCacheHeaders
		});
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	const data = readAsset(id);
	return typeof data?.then === "function" ? data.then((resolved) => assertAssetData(resolved)) : assertAssetData(data);
});
function assertAssetData(data) {
	if (data === null || data === void 0) throw new HTTPError({
		status: 404,
		headers: noCacheHeaders
	});
	return data;
}
// #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/assets/**",
		rank: 0,
		rules: [{
			name: "headers",
			route: "/assets/**",
			handler: headers,
			options: { "cache-control": "public, max-age=31536000, immutable" }
		}]
	};
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1);
		let s = p.split("/");
		let l = s.length;
		let _w;
		if (l > 1) {
			if (s[1] === "assets") r.push(l > 2 ? {
				data: $0,
				params: {
					"0": _w = p.slice(8),
					_: _w
				}
			} : {
				data: $0,
				params: {}
			});
		}
		return r.reverse();
	};
})();
var _lazy_81e63413b606e147 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_81e63413b606e147
	};
	return ((_m, p) => {
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1);
		const w = p.slice(1);
		return {
			data,
			params: w ? {
				"0": w,
				_: w
			} : {}
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/error/utils.mjs
function createErrorHeaders(error, event, unhandled) {
	const headers = new Headers(unhandled ? {} : error.headers);
	const errHeaders = event.res?.errHeaders;
	if (errHeaders) for (const [name, value] of errHeaders) if (name === "set-cookie") headers.append(name, value);
	else headers.set(name, value);
	return headers;
}
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = createErrorHeaders(error, event, unhandled);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
// #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
// #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => {
		event.context.routeRules = getRouteRules(event.req.method, event.url.pathname).routeRules;
		if (event.req.method === "HEAD") {
			const route = findRoute("HEAD", event.url.pathname);
			return route?.data.method ? route : findRoute("GET", event.url.pathname);
		}
		return findRoute(event.req.method, event.url.pathname);
	};
	h3App["~middleware"].push(createRouteRulesMiddleware());
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~middleware"].push(createCacheRuleMiddleware());
	return h3App;
}
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new t$1();
}
function getRouteRules(method, pathname) {
	return matchRouteRules(method, pathname);
}
function createRouteRulesMiddleware() {
	const middleware = (event, next) => {
		const { rules, cache } = resolveRouteRuleChains(event.req.method, event.url.pathname);
		if (cache) event[kCacheRule] = cache;
		return rules ? rules(event, next) : next();
	};
	return markUntraced(middleware);
}
function createCacheRuleMiddleware() {
	const middleware = (event, next) => {
		const cache = event[kCacheRule];
		return cache ? cache(event, next) : next();
	};
	return markUntraced(middleware);
}
var _matchRouteRules;
function matchRouteRules(method, pathname) {
	return (_matchRouteRules ??= memoizeRouteRulesMatcher(createMatcherFromFind(findRouteRules)))(method, pathname);
}
var kCacheRule = /* @__PURE__ */ Symbol("nitro.cacheRule");
var _routeRuleChains = /* @__PURE__ */ new WeakMap();
function resolveRouteRuleChains(method, pathname) {
	const { matchedRules, routeRuleMiddleware } = matchRouteRules(method, pathname);
	if (routeRuleMiddleware.length === 0) return {};
	let chains = _routeRuleChains.get(routeRuleMiddleware);
	if (!chains) {
		const hasCache = !!matchedRules.cache?.handler;
		const rules = hasCache ? routeRuleMiddleware.slice(0, -1) : routeRuleMiddleware;
		chains = {
			rules: rules.length > 0 ? composeMiddleware(rules) : void 0,
			cache: hasCache ? routeRuleMiddleware.at(-1) : void 0
		};
		_routeRuleChains.set(routeRuleMiddleware, chains);
	}
	return chains;
}
function markUntraced(middleware) {
	middleware.__traced__ = true;
	return middleware;
}
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
// #nitro/virtual/server-entry
var serverEntryOptions = {};
// #nitro/virtual/tracing
var tracingSrvxPlugins = [];
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/serve.mjs
function resolveServeOptions(opts) {
	const { port, hostname, tls, ...entryOptions } = serverEntryOptions;
	const env = globalThis.process?.env || {};
	const _parsedPort = Number.parseInt(env.NITRO_PORT ?? env.PORT ?? "");
	const cert = env.NITRO_SSL_CERT;
	const key = env.NITRO_SSL_KEY;
	const socketPath = env.NITRO_UNIX_SOCKET;
	const resolved = {
		...entryOptions,
		port: Number.isNaN(_parsedPort) ? port ?? 3e3 : _parsedPort,
		hostname: env.NITRO_HOST || env.HOST || hostname,
		tls: cert && key ? {
			cert,
			key
		} : tls,
		...opts,
		plugins: [...tracingSrvxPlugins, ...opts.plugins || []]
	};
	for (const runtime of [
		"node",
		"bun",
		"deno"
	]) if (entryOptions[runtime] && opts[runtime]) resolved[runtime] = {
		...entryOptions[runtime],
		...opts[runtime]
	};
	if (socketPath) {
		resolved.node = {
			...resolved.node,
			path: socketPath
		};
		resolved.bun = {
			...resolved.bun,
			unix: socketPath
		};
		resolved.deno = {
			...resolved.deno,
			path: socketPath
		};
	}
	return resolved;
}
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/shutdown.mjs
function setupCloseHooks(server) {
	const closeServer = server.close.bind(server);
	let closeHooks;
	server.close = (closeActiveConnections) => closeServer(closeActiveConnections).finally(() => closeHooks ??= callCloseHooks());
}
async function callCloseHooks() {
	try {
		await useNitroHooks().callHook("close");
	} catch (error) {
		console.error("[nitro] Error while calling `close` hooks:", error);
	}
}
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var nitroApp = useNitroApp();
var server = serve(resolveServeOptions({ fetch: nitroApp.fetch }));
server.ready().catch((error) => {
	console.error("[nitro] Failed to start server:", error);
	process.exit(1);
});
setupCloseHooks(server);
trapUnhandledErrors();
var node_server_default = {};
export { node_server_default as default };
