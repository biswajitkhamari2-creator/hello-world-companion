import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/revision-hub-BegHUqyT.js
var $$splitComponentImporter = () => import("./revision-hub-CyI14MGQ.mjs");
var Route = createFileRoute("/_authenticated/revision-hub")({
	head: () => ({ meta: [{ title: "AI Revision Hub — UPSC Genius AI" }, {
		name: "description",
		content: "12-in-one AI revision engine: one-liners, PYQs, mind maps, flashcards, notes, planners, quizzes, mnemonics and analytics for UPSC."
	}] }),
	validateSearch: (s) => ({ tab: typeof s.tab === "string" ? s.tab : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
