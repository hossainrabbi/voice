"use client";

import { UserCircle, Menu } from "lucide-react";

export function Header({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 z-10 relative shadow-sm">
      <div className="flex items-center">
        {onOpenSidebar && (
          <button 
            onClick={onOpenSidebar}
            className="mr-4 text-slate-500 hover:text-slate-900 md:hidden transition-colors"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        )}
        <div className="flex flex-1">
          {/* We can add search or breadcrumbs here in the future */}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-full p-1 text-slate-500 hover:text-indigo-600 transition-colors">
          <span className="sr-only">Open user menu</span>
          <UserCircle className="h-8 w-8" />
        </button>
      </div>
    </header>
  );
}
