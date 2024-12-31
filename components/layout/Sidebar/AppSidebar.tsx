"use client";

import * as React from "react";
import {
  Link as Chain,
  Scan,
  PanelLeftIcon,
  PanelLeft,
  Settings2,
  Menu,
  ListCheckIcon,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Frame,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  ComponentIcon,
  CoinsIcon,
  ScanSearchIcon,
} from "lucide-react";
import { NavMain } from "@/components/layout/Sidebar/NavMain";
import { NavUser } from "@/components/layout/Sidebar/nav-user";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SidebarMenuButton,
  SidebarMenuSubButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuItem,
  SidebarMenu,
  SidebarGroup,
  SidebarSeparator,
} from "../../ui/sidebar";
import { VisuallyHidden, Root } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import Link from "next/link";

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <>
      {/* Mobile Drawer using Sheet component */}
      <div className="md:hidden z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 bg-primary rounded-lg hover:bg-primary/90">
              <Menu className="h-6 w-6 text-primary-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] p-0 bg-primary text-gray-50"
          >
            <VisuallyHidden>
              <SheetTitle>Main</SheetTitle>
            </VisuallyHidden>
            <div className="h-full flex flex-col">
              <MobileSidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div
          className={`
          relative 
          ${isCollapsed ? "w-[80px]" : "w-60"}
          transition-all duration-300
          border-r
          border-itemborder
          h-screen
        `}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-0 top-1/2 bg-gray-300 rounded-full p-1 z-10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-primary-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-primary-foreground" />
            )}
          </button>

          <div className="flex flex-col h-full">
            <DesktopSidebarContent isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>
    </>
  );
}

function MobileSidebarContent() {
  return (
    <>
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="trackit" height={40} width={40} />
          <span className="font-bold text-2xl">TrackIt</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <NavMain items={items} />
      </div>

      <div className="p-4">
        <NavUser user={data.user} />
      </div>
    </>
  );
}

function DesktopSidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <>
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="trackit" height={40} width={40} />
          {!isCollapsed && <span className="font-bold text-2xl">TrackIt</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/dashboard">
                  <PanelLeftIcon />
                  <span className="text-base">Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#">
                  <ListCheckIcon />
                  <span className="text-base">Watchlist</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#">
                  <ScanSearchIcon />
                  <span className="text-base">Portfolio Tracker</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="my-4 bg-itemborder" />
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {chains.map((chain, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={chain.logo}
                        alt={chain.name}
                        width={20}
                        height={20}
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <span className="text-base tracking-wider">
                      {chain.name}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </div>

      <div className="p-4">
        <NavUser user={data.user} showDetails={!isCollapsed} />
      </div>
    </>
  );
}

const data = {
  user: {
    name: "Dang Hoang Lam",
    email: "m@example.com",
    avatar: "/logo.png",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Chains",
      url: "#",
      icon: Chain,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Dexes",
      url: "#",
      icon: Scan,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Dashboard",
      url: "#",
      icon: PanelLeft,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "More",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

const items = [
  {
    title: "Chains",
    url: "#",
    icon: Chain,
    collapsible: true,
    items: [
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/movement-mark.svg"
              alt="WarpGate"
              width={24}
              height={24}
            />
            <span>MOVE</span>
          </div>
        ),
        url: "#",
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <Image src="/Aptos_mark.png" alt="Aptos" width={24} height={24} />
            <span>APT</span>
          </div>
        ),
        url: "#",
      },
    ],
  },
  {
    title: "Dexes",
    url: "#",
    icon: Scan,
    collapsible: true,
    items: [
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <Image src="/warpgate.png" alt="WarpGate" width={24} height={24} />
            <span>WarpGate</span>
          </div>
        ),
        url: "#",
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <Image src="/routex.png" alt="RouteX" width={24} height={24} />
            <span>RouteX</span>
          </div>
        ),
        url: "#",
      },
    ],
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: PanelLeft,
    collapsible: false,
  },
];

const chains = [
  {
    name: "Movement",
    logo: "/chains/movement-mark.svg",
  },
  {
    name: "Polkadot",
    logo: "/chains/polkadot.svg",
  },
  {
    name: "Berachain",
    logo: "/chains/berachain.png",
  },
  {
    name: "Starknet",
    logo: "/chains/starknet.svg",
  },

  {
    name: "Manta",
    logo: "/chains/manta.svg",
  },
  {
    name: "Kaia",
    logo: "/chains/kaia.svg",
  },
  {
    name: "Ancient8",
    logo: "/chains/ancient8.svg",
  },
  {
    name: "Sui",
    logo: "/chains/sui.svg",
  },
];
