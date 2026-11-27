import { HTTPError, toRequest } from "../_libs/h3+rou3+srvx.mjs";
// #nitro/virtual/services
function lazyService(name, loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => {
			const m = typeof _mod.default?.fetch === "function" ? _mod.default : _mod;
			if (typeof m.fetch !== "function") throw new TypeError(`[nitro] Service "${name}" entry does not export a \`fetch\` handler.`);
			return mod = m;
		}).catch((error) => {
			promise = void 0;
			throw error;
		});
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService("ssr", () => import("../_ssr/ssr.mjs").then((n) => n.ssr_exports)) };
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/services.mjs
function fetchService(name, input, init) {
	const service = services[name];
	if (!service) throw HTTPError.status(404);
	return Promise.resolve(service.fetch(toRequest(input, init)));
}
// node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/routes/ssr-renderer.mjs
function ssrRenderer(event) {
	return fetchService("ssr", event.req);
}
export { ssrRenderer as default };
