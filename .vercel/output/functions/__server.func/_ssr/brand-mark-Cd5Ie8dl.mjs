import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn } from "./button-CCQEfgNs.mjs";
import { Rt as BookOpen } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brand-mark-Cd5Ie8dl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SUFFIX = "by Sidheswar Enterprises";
/**
* Animated brand lockup:
*   UPSC Mitra  ·  by Sidheswar Enterprises (typed + erased loop)
*/
function BrandMark({ size = "md", className }) {
	const [text, setText] = (0, import_react.useState)("");
	const stateRef = (0, import_react.useRef)({
		i: 0,
		dir: 1,
		pause: 0
	});
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => {
			const s = stateRef.current;
			if (s.pause > 0) {
				s.pause -= 1;
				return;
			}
			s.i += s.dir;
			if (s.i >= 24) {
				s.i = 24;
				s.dir = -1;
				s.pause = 22;
			} else if (s.i <= 0) {
				s.i = 0;
				s.dir = 1;
				s.pause = 6;
			}
			setText(SUFFIX.slice(0, s.i));
		}, 80);
		return () => clearInterval(id);
	}, []);
	const iconBox = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
	const iconSize = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
	const title = size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-base" : "text-sm sm:text-lg";
	const suffix = size === "lg" ? "text-sm sm:text-base" : size === "sm" ? "text-[10px]" : "text-[10px] sm:text-xs";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("flex min-w-0 items-center gap-2.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm", iconBox),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
				className: iconSize,
				"aria-hidden": "true"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 flex-col leading-tight",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("font-serif font-semibold tracking-tight whitespace-nowrap", title),
				children: ["UPSC ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-accent",
					children: "Genius AI"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("font-mono italic tracking-wide text-muted-foreground whitespace-nowrap", suffix),
				"aria-label": "by Sidheswar Enterprises",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "bg-clip-text font-semibold not-italic text-transparent",
					style: { backgroundImage: "linear-gradient(90deg, #e11d48 0%, #f59e0b 50%, #10b981 100%)" },
					children: text
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-0.5 inline-block w-[1px] animate-pulse bg-accent align-middle",
					style: { height: "0.9em" },
					"aria-hidden": "true"
				})]
			})]
		})]
	});
}
//#endregion
export { BrandMark as t };
