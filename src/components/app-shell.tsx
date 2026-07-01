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
import { cn } from "@/lib/utils";

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
      { title: "AI Newspaper", url: "/dashboard?mode=newspaper", icon: Newspaper },
      { title: "Telegram Inbox", url: "/inbox", icon: Inbox },
      { title: "PDF Library", url: "/dashboard?tab=library", icon: FolderOpen },
      { title: "Institution Engine", url: "/institution", icon: GraduationCap, badge: "New" },
    ],
  },
  {
    label: "Generate",
    items: [
      { title: "Handwritten Notes", url: "/dashboard?gen=handwritten", icon: PenLine },
      { title: "Short Notes", url: "/dashboard?gen=short", icon: StickyNote },
      { title: "Infographics", url: "/dashboard?gen=infographics", icon: ImageIcon },
      { title: "Mind Maps", url: "/dashboard?gen=mindmap", icon: Brain },
      { title: "Flashcards", url: "/dashboard?gen=flashcards", icon: Layers },
      { title: "Question Generator", url: "/dashboard?gen=questions", icon: HelpCircle },
      { title: "PYQ Explorer", url: "/dashboard?gen=pyq", icon: Library },
    ],
  },
  {
    label: "Daily Practice",
    items: [
      { title: "Current Affairs", url: "/dashboard?tab=current-affairs", icon: CalendarClock },
      { title: "Editorial Analyser", url: "/editorial", icon: FileEdit },
      { title: "Daily Revision", url: "/dashboard?tab=revision", icon: Repeat },
      { title: "Study Planner", url: "/dashboard?tab=planner", icon: CalendarRange },
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
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Open navigation"
      onClick={toggleSidebar}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-[0_10px_28px_-8px_rgba(99,102,241,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-8px_rgba(217,70,239,0.75)] active:scale-95"
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 opacity-95 transition-opacity group-hover:opacity-100" />
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 opacity-60 blur-md transition-opacity group-hover:opacity-90" />
      <span className="absolute inset-[1px] rounded-[14px] bg-background/10 backdrop-blur-md" />
      <Menu className="relative h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-90" />
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
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative min-h-dvh flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AiQuotaBanner />
          <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl">
            <HamburgerTrigger />
            <Link to="/" className="ml-1 block min-w-0">
              <BrandMark size="sm" />
            </Link>
            <div className="ml-auto flex items-center gap-2">{topbarRight}</div>
          </div>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
