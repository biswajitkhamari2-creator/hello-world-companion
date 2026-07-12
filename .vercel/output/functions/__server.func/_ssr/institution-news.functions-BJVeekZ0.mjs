import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { ct as objectType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/institution-news.functions-BJVeekZ0.js
var getInstitutionNews = createServerFn({ method: "GET" }).handler(createSsrRpc("a87a3facca26de65f390ca02626843a3d367b4cc18ac8bd9bc6b6a1dad9c9a37"));
var getInstitutionArticle = createServerFn({ method: "POST" }).inputValidator((data) => {
	if (!/^https:\/\/(visionias\.in|www\.drishtiias\.com)\//.test(data.url)) throw new Error("Only Vision IAS or Drishti IAS URLs are allowed");
	return data;
}).handler(createSsrRpc("988112bba6f2932c59fd2b9d26ca234b336b5e71d7b2e41de1c79db36da99ce2"));
var getInstitutionCrispNotes = createServerFn({ method: "POST" }).inputValidator((data) => {
	return objectType({ url: stringType().regex(/^https:\/\/(visionias\.in|www\.drishtiias\.com)\//, "Only Vision IAS or Drishti IAS URLs are allowed") }).parse(data);
}).handler(createSsrRpc("d6d3c0725e82a405def7902e792bee26dda466982288f7d816aeb32f45d33897"));
var GenericUrl = objectType({
	url: stringType().url().refine((u) => /^https?:\/\//i.test(u), "Only http(s) URLs allowed"),
	sourceLabel: stringType().max(80).optional()
});
var getArticleCrispNotes = createServerFn({ method: "POST" }).inputValidator((data) => GenericUrl.parse(data)).handler(createSsrRpc("8db36deca9b9c33e247941a3ca4f47df75bf985da91826ae664ccb996a7f5d95"));
var getArticleComprehensiveNotes = createServerFn({ method: "POST" }).inputValidator((data) => GenericUrl.parse(data)).handler(createSsrRpc("f515e22b7db9fc0360117baafeb65ee3b1b3661326bff3276e03a17114e0f615"));
var getInstitutionComprehensiveNotes = createServerFn({ method: "POST" }).inputValidator((data) => {
	return objectType({ url: stringType().regex(/^https:\/\/(visionias\.in|www\.drishtiias\.com)\//, "Only Vision IAS or Drishti IAS URLs are allowed") }).parse(data);
}).handler(createSsrRpc("ae63e4cc3f3d27eb98353f672a20675f201cfd2a9b4139554fc1e9edee42b785"));
//#endregion
export { getInstitutionCrispNotes as a, getInstitutionComprehensiveNotes as i, getArticleCrispNotes as n, getInstitutionNews as o, getInstitutionArticle as r, getArticleComprehensiveNotes as t };
