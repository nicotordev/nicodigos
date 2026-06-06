"use client";

import { ReactNode } from "react";

interface CategorySidebarProps {
  readonly children: ReactNode;
}

export function CategorySidebar({ children }: CategorySidebarProps) {
  return (
    <aside className="w-[280px] shrink-0 hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {children}
      </div>
    </aside>
  );
}
