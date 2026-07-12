import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mentor-DatVLPRl.js
var $$splitComponentImporter = () => import("./mentor-DALbnaqw.mjs");
var Route = createFileRoute("/_authenticated/mentor")({
	validateSearch: (s) => ({ seed: typeof s.seed === "string" ? s.seed : void 0 }),
	head: () => ({ meta: [{ title: "AI Mentor — UPSC Mitra" }, {
		name: "description",
		content: "Chat with an AI UPSC mentor. Ask any syllabus topic, get exam-grade explanations, and use voice input/output."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
