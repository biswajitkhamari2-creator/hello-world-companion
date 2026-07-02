import type { ComponentType, ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import {
  LayoutDashboard,
  Sparkles,
  Newspaper,
  Inbox,
  FolderOpen,
  PenLine,
  StickyNote,
  ImageIcon,
  Brain,
  Layers,
  HelpCircle,
  Library,
  Landmark,
  Scale,
  Banknote,
  HeartHandshake,
  CalendarClock,
  FileEdit,
  Repeat,
  CalendarRange,
  ClipboardCheck,
  Download,
  Bookmark,
  User,
  Settings,
  Menu,
  GraduationCap,
  Sun,
  Moon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { BrandMark } from "@/components/brand-mark";
import { AiQuotaBanner } from "@/components/ai-quota-banner";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

function DashboardBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0b1024] to-slate-950 opacity-0 dark:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 opacity-100 dark:opacity-0 transition-opacity" />
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/30 to-transparent blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-cyan-400/35 via-blue-500/30 to-transparent blur-3xl animate-float-slow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute -bottom-40 left-1/4 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-fuchsia-500/30 via-purple-500/25 to-transparent blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]" style={{
        backgroundImage:
          "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
      }} />
    </div>
  );
}

function Breadcrumbs() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const crumbs = parts.map((p, i) => ({
    label: p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    to: "/" + parts.slice(0, i + 1).join("/"),
  }));
  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
      {crumbs.map((c, i) => (
        <span key={c.to} className="flex items-center gap-1.5">
          <span className="opacity-40">/</span>
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link to={c.to} className="hover:text-foreground transition-colors">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

type NavItem = {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "AI Mentor", url: "/mentor", icon: Sparkles },
      { title: "Telegram Inbox", url: "/inbox", icon: Inbox },
      { title: "News Archive", url: "/news-archive", icon: CalendarClock },
      { title: "Institution Engine", url: "/institution", icon: GraduationCap, badge: "New" },
      { title: "Editorial Lab", url: "/editorial-lab", icon: FileEdit, badge: "Pro" },
    ],
  },
  {
    label: "Daily Practice",
    items: [
      { title: "AI Revision Hub", url: "/revision-hub", icon: Sparkles, badge: "New" },
      { title: "Editorial Analyser", url: "/editorial", icon: FileEdit },
      { title: "Daily Revision", url: "/revision-hub?tab=planner", icon: Repeat },
      { title: "Flashcards", url: "/revision-hub?tab=flashcards", icon: CalendarRange },
      { title: "Mock Tests", url: "/mocks", icon: ClipboardCheck },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Downloads", url: "/downloads", icon: Download },
      { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
      { title: "Profile", url: "/profile", icon: User },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

function SidebarNavLink({ item, active, index = 0 }: { item: NavItem; active: boolean; index?: number }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [path, query] = item.url.split("?");
  const search: Record<string, string> = {};
  if (query) {
    for (const [k, v] of new URLSearchParams(query)) search[k] = v;
  }
  return (
    <SidebarMenuItem
      className="animate-fade-in"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: "both" }}
    >
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className={cn(
          "group/nav relative my-1 h-auto rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 backdrop-blur-md transition-all duration-300",
          "shadow-[0_4px_14px_-6px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 hover:translate-x-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_10px_28px_-10px_rgba(99,102,241,0.55)]",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-indigo-500/0 before:via-fuchsia-500/0 before:to-amber-400/0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 hover:before:from-indigo-500/10 hover:before:via-fuchsia-500/10 hover:before:to-amber-400/10",
          active &&
            "border-transparent bg-gradient-to-r from-indigo-500/25 via-fuchsia-500/20 to-amber-400/20 text-foreground shadow-[0_10px_30px_-10px_rgba(217,70,239,0.55)]",
        )}
      >
        <Link
          to={path}
          search={query ? search : undefined}
          onClick={() => { if (isMobile) setOpenMobile(false); }}
          className="relative flex w-full items-center gap-3"
        >
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-all duration-300 group-hover/nav:scale-110 group-hover/nav:-rotate-6",
              active
                ? "bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 text-white shadow-[0_6px_18px_-4px_rgba(217,70,239,0.7)] ring-1 ring-white/30"
                : "bg-gradient-to-br from-white/10 to-white/5 text-foreground/70 ring-1 ring-white/10 group-hover/nav:text-foreground group-hover/nav:from-indigo-500/30 group-hover/nav:to-fuchsia-500/20",
            )}
          >
            <item.icon className={cn("h-4 w-4 transition-transform", active && "animate-pulse")} />
          </span>
          <span className="truncate text-[13.5px] font-medium tracking-tight">{item.title}</span>
          {item.badge ? (
            <span className="ml-auto rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              {item.badge}
            </span>
          ) : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border/70">
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-3">
        <Link to="/" className="block">
          <BrandMark size="sm" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-1.5 py-2">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((it, i) => (
                  <SidebarNavLink
                    key={it.title}
                    item={it}
                    index={i}
                    active={pathname === it.url || pathname === it.url.split("?")[0]}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 px-3 py-3 text-[11px] text-muted-foreground">
        <SignOutButton />
        <span className="mt-2 font-medium text-foreground/80">UPSC</span>
        <span className="opacity-70">by Sidheswar Enterprises</span>
      </SidebarFooter>
    </Sidebar>
  );
}

function SignOutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
    >
      <LogOut className="h-3.5 w-3.5" /> Sign out
    </button>
  );
}

function HamburgerTrigger() {
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;
  return (
    <button
      type="button"
      aria-label={isOpen ? "Close navigation" : "Open navigation"}
      aria-expanded={isOpen}
      onClick={toggleSidebar}
      className="group relative inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-90"
    >
      {/* animated conic gradient ring */}
      <span
        className="absolute -inset-[2px] rounded-[18px] opacity-90 blur-[6px] transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "conic-gradient(from 0deg, #6366f1, #d946ef, #f59e0b, #22d3ee, #6366f1)",
          animation: "spin 6s linear infinite",
        }}
      />
      {/* solid gradient face */}
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 shadow-[0_10px_28px_-8px_rgba(217,70,239,0.65)]" />
      {/* glass inner */}
      <span className="absolute inset-[1.5px] rounded-[14px] bg-background/20 backdrop-blur-xl ring-1 ring-white/20" />
      {/* sparkle */}
      <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.9)] animate-ping" />

      {/* animated 3-bar / X icon */}
      <span className="relative flex h-4 w-5 flex-col items-center justify-center gap-[3px]">
        <span
          className={cn(
            "h-[2px] w-5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)] transition-all duration-300",
            isOpen ? "translate-y-[5px] rotate-45" : "group-hover:w-4",
          )}
        />
        <span
          className={cn(
            "h-[2px] w-4 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)] transition-all duration-300",
            isOpen ? "opacity-0 scale-x-0" : "group-hover:w-5",
          )}
        />
        <span
          className={cn(
            "h-[2px] w-3 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)] transition-all duration-300",
            isOpen ? "-translate-y-[5px] -rotate-45 w-5" : "group-hover:w-5",
          )}
        />
      </span>
    </button>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/70 text-foreground shadow-sm backdrop-blur-xl transition-all hover:scale-110 hover:shadow-md dark:border-white/10 dark:bg-white/5"
    >
      {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
    </button>
  );
}

export function AppShell({
  children,
  topbarRight,
}: {
  children: ReactNode;
  topbarRight?: ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative min-h-dvh flex w-full bg-transparent">
        <DashboardBackdrop />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AiQuotaBanner />
          <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] px-3 backdrop-blur-2xl shadow-[0_8px_24px_-16px_rgba(15,23,42,0.25)]">
            <HamburgerTrigger />
            <Link to="/" className="ml-1 block min-w-0">
              <BrandMark size="sm" />
            </Link>
            <div className="ml-3 hidden lg:block h-6 w-px bg-border/60" />
            <Breadcrumbs />
            <div className="ml-auto flex items-center gap-2">
              {topbarRight}
              <ThemeToggle />
            </div>
          </div>
          <div key={pathname} className="flex-1 min-w-0 animate-fade-in">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
