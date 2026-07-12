import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { W as LoaderCircle, _t as CloudUpload, d as Trash2, gt as Cloud, lt as FileText, mt as Download, pt as ExternalLink, rt as HardDrive, y as Sparkles } from "../_libs/lucide-react.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { r as deleteDocument, s as listDocuments } from "./documents.functions-RRwEEipk.mjs";
import { clearDownloads, deleteDownload, formatSize, getDownloadBlob, listDownloads, onDownloadsUpdated, redownload, updateDownloadMeta } from "./downloads-store-CplUgcTw.mjs";
import { deleteDriveDownload, listDriveDownloads, saveGeneratedDownloadToDrive } from "./downloads.functions-DsESSCxw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/downloads-DuVuLyPE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useLocalDownloads() {
	const [rows, setRows] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		const load = () => listDownloads().then((r) => alive && setRows(r));
		load();
		const off = onDownloadsUpdated(load);
		return () => {
			alive = false;
			off();
		};
	}, []);
	return {
		rows,
		reload: () => listDownloads().then(setRows)
	};
}
function KindBadge({ kind }) {
	const map = {
		pdf: "from-rose-500 to-orange-500",
		notes: "from-sky-500 to-indigo-500",
		editorial: "from-amber-500 to-fuchsia-500",
		report: "from-emerald-500 to-teal-500",
		data: "from-slate-500 to-slate-700",
		image: "from-pink-500 to-purple-500",
		other: "from-slate-400 to-slate-600"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${map[kind] ?? map.other}`,
		children: kind
	});
}
function DownloadsPage() {
	const list = useServerFn(listDocuments);
	const del = useServerFn(deleteDocument);
	const listDrive = useServerFn(listDriveDownloads);
	const delDrive = useServerFn(deleteDriveDownload);
	const saveDrive = useServerFn(saveGeneratedDownloadToDrive);
	const qc = useQueryClient();
	const [confirmDocId, setConfirmDocId] = (0, import_react.useState)(null);
	const [confirmDriveId, setConfirmDriveId] = (0, import_react.useState)(null);
	const [confirmLocalId, setConfirmLocalId] = (0, import_react.useState)(null);
	const [savingDriveId, setSavingDriveId] = (0, import_react.useState)(null);
	const [clearing, setClearing] = (0, import_react.useState)(false);
	const local = useLocalDownloads();
	const q = useQuery({
		queryKey: ["downloads-docs"],
		queryFn: () => list()
	});
	const driveQ = useQuery({
		queryKey: ["drive-downloads"],
		queryFn: () => listDrive()
	});
	const mDelete = useMutation({
		mutationFn: (id) => del({ data: { id } }),
		onSuccess: () => {
			toast.success("Document deleted");
			setConfirmDocId(null);
			qc.invalidateQueries({ queryKey: ["downloads-docs"] });
			qc.invalidateQueries({ queryKey: ["documents"] });
		},
		onError: (e) => toast.error(e?.message || "Delete failed")
	});
	const mDeleteDrive = useMutation({
		mutationFn: (id) => delDrive({ data: { id } }),
		onSuccess: () => {
			toast.success("Drive download deleted");
			setConfirmDriveId(null);
			qc.invalidateQueries({ queryKey: ["drive-downloads"] });
		},
		onError: (e) => toast.error(e?.message || "Delete failed")
	});
	const saveLocalToDrive = async (r) => {
		try {
			setSavingDriveId(r.id);
			const blob = await getDownloadBlob(r.id);
			if (!blob) throw new Error("Local file not found. Please download it again once.");
			const fd = new FormData();
			fd.set("file", blob, r.name || "download");
			fd.set("source", r.source || "downloads-page");
			fd.set("kind", r.kind || "other");
			const saved = await saveDrive({ data: fd });
			await updateDownloadMeta(r.id, {
				driveDocumentId: saved.documentId,
				driveFileId: saved.driveFileId,
				driveViewLink: saved.driveViewLink,
				driveSavedAt: Date.now()
			});
			await local.reload();
			qc.invalidateQueries({ queryKey: ["drive-downloads"] });
			toast.success("Saved directly to Google Drive");
		} catch (e) {
			toast.error(e?.message || "Drive save failed");
		} finally {
			setSavingDriveId(null);
		}
	};
	const totalSize = (local.rows ?? []).reduce((n, r) => n + r.size, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-5xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "mb-6 animate-fade-in",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-2xl font-bold",
						children: "Downloads"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Every PDF / notes / report is saved to this page and copied to your Google Drive."
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex flex-wrap items-center justify-between gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "h-4 w-4 text-sky-600" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
								children: "Saved to Google Drive"
							}),
							driveQ.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "text-[10px]",
								children: [
									driveQ.data.length,
									" file",
									driveQ.data.length === 1 ? "" : "s"
								]
							})
						]
					})
				}), driveQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Loading Drive downloads…"]
				}) : !driveQ.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground",
					children: "New downloads are now copied to Google Drive automatically. For old local files, use “Save to Drive” below."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2.5",
					children: driveQ.data.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in sm:flex-row sm:items-center",
						style: {
							animationDelay: `${i * 30}ms`,
							animationFillMode: "both"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 flex-1 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: d.file_name || d.title || "Download"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px]",
											children: "Drive"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(d.created_at).toLocaleString() }),
										d.size_bytes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", formatSize(Number(d.size_bytes))] }) : null
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-end gap-2",
							children: [d.drive_view_link ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: d.drive_view_link,
									target: "_blank",
									rel: "noreferrer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1.5 h-3.5 w-3.5" }), " Open Drive"]
								})
							}) : null, confirmDriveId === d.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "destructive",
									disabled: mDeleteDrive.isPending,
									onClick: () => mDeleteDrive.mutate(d.id),
									children: mDeleteDrive.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Confirm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setConfirmDriveId(null),
									disabled: mDeleteDrive.isPending,
									children: "Cancel"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								className: "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700",
								onClick: () => setConfirmDriveId(d.id),
								title: "Delete from Drive downloads",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})]
						})]
					}, d.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardDrive, { className: "h-4 w-4 text-emerald-600" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
								children: "Local browser cache"
							}),
							local.rows && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "text-[10px]",
								children: [
									local.rows.length,
									" file",
									local.rows.length === 1 ? "" : "s",
									" · ",
									formatSize(totalSize)
								]
							})
						]
					}), local.rows && local.rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						className: "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
						disabled: clearing,
						onClick: async () => {
							if (!confirm("Delete ALL saved downloads?")) return;
							setClearing(true);
							await clearDownloads();
							setClearing(false);
							toast.success("All downloads cleared");
						},
						children: [clearing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1.5 h-3.5 w-3.5" }), "Clear all"]
					})]
				}), local.rows === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Loading…"]
				}) : local.rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
					children: "No local downloads yet. Anything you download from the app — PDFs, notes, editorial extracts — will appear here."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2.5",
					children: local.rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in sm:flex-row sm:items-center",
						style: {
							animationDelay: `${i * 30}ms`,
							animationFillMode: "both"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 flex-1 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: r.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindBadge, { kind: r.kind }),
										r.source && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px]",
											children: r.source
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(r.created_at).toLocaleString() }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", formatSize(r.size)] })
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-end gap-2",
							children: [
								r.meta?.driveViewLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: r.meta.driveViewLink,
										target: "_blank",
										rel: "noreferrer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1.5 h-3.5 w-3.5" }), " Drive"]
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									disabled: savingDriveId === r.id,
									onClick: () => saveLocalToDrive(r),
									children: [savingDriveId === r.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "mr-1.5 h-3.5 w-3.5" }), "Save to Drive"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => redownload(r.id).catch((e) => toast.error(e?.message || "Failed")),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-3.5 w-3.5" }), " Download"]
								}),
								confirmLocalId === r.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "destructive",
										onClick: async () => {
											await deleteDownload(r.id);
											setConfirmLocalId(null);
											toast.success("Removed");
										},
										children: "Confirm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => setConfirmLocalId(null),
										children: "Cancel"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700",
									onClick: () => setConfirmLocalId(r.id),
									title: "Delete",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})
							]
						})]
					}, r.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-teal-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
					children: "Imported documents"
				})]
			}), q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Loading…"]
			}) : !q.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-dashed border-border p-8 text-center animate-scale-in",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mx-auto mb-3 h-8 w-8 text-muted-foreground/60" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No documents imported yet. Upload a PDF from the Dashboard."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							children: "Open Dashboard"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-3",
				children: q.data.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "group flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in sm:flex-row sm:items-center",
					style: {
						animationDelay: `${i * 40}ms`,
						animationFillMode: "both"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: d.title || "Untitled"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground",
								children: [
									d.subject && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: d.subject
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(d.created_at).toLocaleString() }),
									d.size_bytes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· ",
										Math.round(d.size_bytes / 1024).toLocaleString(),
										" KB"
									] }) : null
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-end gap-2",
						children: [
							d.drive_view_link ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: d.drive_view_link,
									target: "_blank",
									rel: "noreferrer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1.5 h-3.5 w-3.5" }), " Drive"]
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/dashboard",
									search: { doc: d.id },
									children: "Open"
								})
							}),
							confirmDocId === d.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "destructive",
									disabled: mDelete.isPending,
									onClick: () => mDelete.mutate(d.id),
									children: mDelete.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Confirm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setConfirmDocId(null),
									disabled: mDelete.isPending,
									children: "Cancel"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								className: "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700",
								onClick: () => setConfirmDocId(d.id),
								title: "Delete",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})
						]
					})]
				}, d.id))
			})] })
		]
	}) });
}
//#endregion
export { DownloadsPage as component };
