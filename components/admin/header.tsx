"use client";

import { LogOut, Menu, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 z-20 relative shadow-sm">
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
      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 rounded-full p-1 text-slate-500 hover:text-indigo-600 transition-colors relative z-50 cursor-pointer"
        >
          <span className="sr-only">Open user menu</span>
          <UserCircle className="h-8 w-8" />
        </button>

        {isDropdownOpen && (
          <>
            {/* Invisible backdrop to catch clicks outside the dropdown */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute top-12 right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
