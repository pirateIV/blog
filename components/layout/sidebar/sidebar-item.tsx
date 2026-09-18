import React from "react";

export function SidebarItem({ children }: { children: React.ReactNode; }) {
  return <div className="space-y-5">{children}</div>;
}
