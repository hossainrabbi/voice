"use client";

import { cn } from "@/lib/utils";
import { ClipboardList, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../common/Logo";

const navigation = [
  { name: "Surveys", href: "/admin/surveys", icon: ClipboardList },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white text-slate-600 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
        <Logo />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                )}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600",
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
