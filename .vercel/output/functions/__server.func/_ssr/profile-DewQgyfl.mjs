import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { At as Calendar, H as Mail, U as LogOut, b as Shield, o as User } from "../_libs/lucide-react.mjs";
import { t as supabase } from "./client-44RWK3KY.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-DewQgyfl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const [email, setEmail] = (0, import_react.useState)(null);
	const [id, setId] = (0, import_react.useState)(null);
	const [createdAt, setCreatedAt] = (0, import_react.useState)(null);
	const [provider, setProvider] = (0, import_react.useState)(null);
	const navigate = useNavigate();
	const qc = useQueryClient();
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data } = await supabase.auth.getUser();
			const u = data.user;
			setEmail(u?.email ?? null);
			setId(u?.id ?? null);
			setCreatedAt(u?.created_at ?? null);
			setProvider(u?.app_metadata?.provider ?? null);
		})();
	}, []);
	async function signOut() {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto w-full max-w-2xl px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "animate-scale-in rounded-2xl border border-border bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-amber-400/10 p-6 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-bold text-white shadow-lg animate-fade-in",
						children: (email?.[0] || "U").toUpperCase()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate font-serif text-xl font-bold",
							children: email || "—"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: ["Signed in via ", provider || "email"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-6 grid gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: Mail,
							label: "Email",
							value: email || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: User,
							label: "User ID",
							value: id || "—",
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: Calendar,
							label: "Joined",
							value: createdAt ? new Date(createdAt).toLocaleDateString() : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: Shield,
							label: "Auth Provider",
							value: provider || "email"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: signOut,
						className: "text-rose-700 hover:bg-rose-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-1.5 h-3.5 w-3.5" }), " Sign out"]
					})
				})
			]
		})
	}) });
}
function Row({ icon: Icon, label, value, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-lg border border-border/70 bg-background/60 p-3 animate-fade-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wide text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `truncate font-medium ${mono ? "font-mono text-xs" : ""}`,
				children: value
			})]
		})]
	});
}
//#endregion
export { ProfilePage as component };
