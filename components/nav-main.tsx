"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup className="mt-4">
      <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title} className="group/collapsible py-1">
            <SidebarMenuButton tooltip={item.title} className="gap-3">
              <span className="opacity-50">
                <item.icon />
              </span>
              <span className="font-medium text-base data-active:text-neutral-400">
                {item.title}
              </span>
              {/* <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" /> */}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
