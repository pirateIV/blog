import React from "react";
import { SidebarItem } from "./layout/sidebar/sidebar-item";
import ActiveLink from "./active-link";
import { blogData } from "@/data/blog";

const blogCategories = Object.keys(blogData);

export default function BlogCategories() {
  return (
    <SidebarItem>
      <h3 className="text-xl font-semibold">Categories</h3>
      <ul className="space-2.5">
        {blogCategories.map((category) => (
          <li key={category}>
            <ActiveLink
              href={`/category/${category}`}
              className="text-xs font-semibold uppercase"
              activeClassName="underline"
            >
              {category}
            </ActiveLink>
          </li>
        ))}
      </ul>
    </SidebarItem>
  );
}
