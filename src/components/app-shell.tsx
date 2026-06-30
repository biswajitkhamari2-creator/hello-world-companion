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
  Shield,
  Menu,
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
    label: "General Studies",
    items: [
      { title: "GS-I", url: "/dashboard?paper=gs1", icon: Landmark },
      { title: "GS-II", url: "/dashboard?paper=gs2", icon: Scale },
      { title: "GS-III", url: "/dashboard?paper=gs3", icon: Banknote },
      { title: "GS-IV", url: "/dashboard?paper=gs4", icon: HeartHandshake },
    ],
  },
  {
    label: "Daily Practice",
    items: [
      { title: "Current Affairs", url: "/dashboard?tab=current-affairs", icon: CalendarClock },
      { title: "Editorial Analyser", url: "/editorial", icon: FileEdit },
      { title: "Daily Revision", url: "/dashboard?tab=revision", icon: Repeat },
      { title: "Study Planner", url: "/dashboard?tab=planner", icon: CalendarRange },
      { title: "Mock Tests", url: "/dashboard?tab=mocks", icon: ClipboardCheck },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Downloads", url: "/dashboard?tab=downloads", icon: Download },
      { title: "Bookmarks", url: "/dashboard?tab=bookmarks", icon: Bookmark },
      { title: "Profile", url: "/dashboard?tab=profile", icon: User },
      { title: "Settings", url: "/dashboard?tab=settings", icon: Settings },
      { title: "Admin Panel", url: "/dashboard?tab=admin", icon: Shield, badge: "Admin" },
    ],
  },
];

function SidebarNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [path, query] = item.url.split("?");
  const search: Record<string, string> = {};
  if (query) {
    for (const [k, v] of new URLSearchParams(query)) search[k] = v;
  }
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className={cn(
          "group/nav rounded-lg transition-all duration-200",
          "hover:translate-x-0.5 hover:bg-sidebar-accent/80",
          active &&
            "bg-gradient-to-r from-indigo-500/15 via-fuchsia-500/10 to-amber-400/10 text-foreground shadow-sm",
        )}
      >
        <Link
          to={path}
          search={query ? search : undefined}
          onClick={() => { if (isMobile) setOpenMobile(false); }}
          className="flex w-full items-center gap-2.5"
        >
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors",
              active
                ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md"
                : "bg-sidebar-accent/60 text-foreground/70 group-hover/nav:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
          </span>
          <span className="truncate text-[13.5px] font-medium">{item.title}</span>
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
                {group.items.map((it) => (
                  <SidebarNavLink
                    key={it.title}
                    item={it}
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
        <span className="mt-2 font-medium text-foreground/80">UPSC Genius AI</span>
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-paper/70 text-foreground shadow-sm backdrop-blur transition-all hover:bg-paper hover:shadow-md active:scale-95"
    >
      <Menu className="h-4.5 w-4.5" />
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
          <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl">
            <HamburgerTrigger />
            <Link to="/" className="ml-1 hidden min-w-0 sm:block">
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
