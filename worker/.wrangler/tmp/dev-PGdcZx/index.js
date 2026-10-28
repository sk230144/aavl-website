var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../scripts/instruments.mjs
var INSTRUMENTS = [
  { id: "SENSEX", label: "SENSEX", name: "S&P BSE SENSEX", yahoo: "^BSESN", range: "5y", ohlc: true },
  { id: "NIFTY", label: "NIFTY 50", name: "NIFTY 50", yahoo: "^NSEI", range: "1y" },
  { id: "BSE500", label: "BSE 500", name: "S&P BSE 500", yahoo: "BSE-500.BO", range: "1y" },
  { id: "USDINR", label: "USD/INR", name: "US dollar / Indian rupee", yahoo: "INR=X", range: "1y" },
  { id: "GOLD", label: "Gold (USD)", name: "Gold futures, USD per troy ounce", yahoo: "GC=F", range: "1y" },
  { id: "RELIANCE", label: "Reliance", name: "Reliance Industries", yahoo: "RELIANCE.BO", range: "1d" },
  { id: "HDFCBANK", label: "HDFC Bank", name: "HDFC Bank", yahoo: "HDFCBANK.BO", range: "1d" },
  { id: "TCS", label: "TCS", name: "Tata Consultancy Services", yahoo: "TCS.BO", range: "1d" },
  { id: "INFY", label: "Infosys", name: "Infosys", yahoo: "INFY.BO", range: "1d" },
  { id: "ICICIBANK", label: "ICICI Bank", name: "ICICI Bank", yahoo: "ICICIBANK.BO", range: "1d" },
  { id: "SBIN", label: "SBI", name: "State Bank of India", yahoo: "SBIN.BO", range: "1d" },
  { id: "ITC", label: "ITC", name: "ITC", yahoo: "ITC.BO", range: "1d" }
];

// src/index.js
var SPARK_URL = "https://query1.finance.yahoo.com/v8/finance/spark";
var FRESH_SECONDS = 20;
var STALE_SECONDS = 6 * 60 * 60;
var CORS = { "Access-Control-Allow-Origin": "*" };
var lastGood = null;
var round = /* @__PURE__ */ __name((value) => Math.round(value * 100) / 100, "round");
async function fetchQuotes() {
  const params = new URLSearchParams({ symbols: INSTRUMENTS.map((instrument) => instrument.yahoo).join(","), range: "1d", interval: "1m" });
  const response = await fetch(`${SPARK_URL}?${params}`, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8e3) });
  if (!response.ok) throw new Error(`Yahoo responded ${response.status}`);
  const spark = await response.json();
  const instruments = {};
  for (const { id, yahoo } of INSTRUMENTS) {
    const series = spark[yahoo];
    const closes = series?.close ?? [];
    let last = closes.length - 1;
    while (last >= 0 && closes[last] == null) last -= 1;
    if (last < 0) continue;
    const price = series.fulldayPrice ?? closes[last];
    let { fulldayChange: change, fulldayChangePercent: changePct } = series;
    if (change == null || changePct == null) {
      const previous = series.previousClose ?? series.chartPreviousClose;
      if (!previous) continue;
      change = price - previous;
      changePct = change / previous * 100;
    }
    instruments[id] = {
      price: round(price),
      change: round(change),
      changePct: round(changePct),
      // Start of the latest one-minute bar.
      asOf: new Date(series.timestamp[last] * 1e3).toISOString()
    };
  }
  if (!Object.keys(instruments).length) throw new Error("no quotes in the response");
  return JSON.stringify({ updatedAt: (/* @__PURE__ */ new Date()).toISOString(), instruments });
}
__name(fetchQuotes, "fetchQuotes");
var reply = /* @__PURE__ */ __name((body, maxAge) => new Response(body, { headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=${maxAge}` } }), "reply");
var src_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...CORS, "Access-Control-Allow-Methods": "GET", "Access-Control-Max-Age": "86400" } });
    }
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405, headers: { ...CORS, Allow: "GET, OPTIONS" } });
    const now = Date.now();
    if (lastGood && now - lastGood.fetchedAt < FRESH_SECONDS * 1e3) return reply(lastGood.body, FRESH_SECONDS);
    const cacheKey = new Request(new URL("/quotes", request.url).toString());
    const cached = await caches.default.match(cacheKey);
    if (cached) return cached;
    try {
      const body = await fetchQuotes();
      lastGood = { body, fetchedAt: now };
      const response = reply(body, FRESH_SECONDS);
      ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
      return response;
    } catch (error) {
      console.error(JSON.stringify({ message: "quote fetch failed", error: error instanceof Error ? error.message : String(error) }));
      if (lastGood && now - lastGood.fetchedAt < STALE_SECONDS * 1e3) return reply(lastGood.body, 5);
      return Response.json({ error: "Quotes unavailable" }, { status: 502, headers: { ...CORS, "Cache-Control": "no-store" } });
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-oYqIP8/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-oYqIP8/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
