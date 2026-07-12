import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/telegram-inbox.functions-Z2cjJrpK.js
/** Public Drive download (Anyone-with-the-link files). Handles the >100MB confirm interstitial. */
var listInbox = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d ?? {}).handler(createSsrRpc("ed98bb8f5620ee3dff09894a3f181a04c6f035f38226aabffcf12895acc26142"));
var importInboxItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("a0f536140d787bb66b77ee595842a61449c58a1a278ad7337e6988774079bea4"));
var archiveInboxItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("80756e899abd2c9ef1af73c4587a432dc7f92ef051f57d540d532448233594b4"));
var deleteInboxItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("0625e3685ecc541699abd64a34eb67a1066a78a6db88599bd4b051ebdac32cbe"));
var deleteInboxItems = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("5efbe3fb097e72bb4adcf5fe8649f13ae32b925b890211fedd5ab61c38905a27"));
//#endregion
export { listInbox as a, importInboxItem as i, deleteInboxItem as n, deleteInboxItems as r, archiveInboxItem as t };
