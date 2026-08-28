"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import { useLogout } from "@/services/users/usersQueries";
import { dashboardMenuItems } from "@/lib/constants";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate, isPending, isError, error } = useLogout();

const logoutFunc = () => {
  mutate(undefined, {
    onSuccess: () => {
      router.push("/login");
    },
  });
};

  return (
    <aside className="hidden w-72 sticky top-0 border-r border-gray-200 bg-white lg:flex lg:flex-col h-dvh">
      <div className="border-b border-gray-200 px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E2B6D] text-xl font-bold text-white">
            R
          </div>

          <div>
            <h1 className="text-lg font-bold text-[#1E2B6D]">
              Панель Администратора
            </h1>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto">
        <nav className="flex flex-col gap-2 p-4">
          {dashboardMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-[#1E2B6D] text-white shadow-md"
                    : "text-[#1E2B6D] hover:bg-[#F3F4F6]",
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-4 rounded-2xl bg-[#F8FAFC] p-4">
            <p className="text-sm font-semibold text-[#1E2B6D]">Админ</p>

            <p className="text-xs font-medium uppercase tracking-wide text-[#39C6C5]">
              Админ
            </p>
          </div>
          {isError && (
            <div className="mb-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
              {error?.message || "Произошла ошибка при выходе"}
            </div>
          )}

          <button
            onClick={logoutFunc}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            <LogOut size={18} />
            {isPending ? "Выход..." : "Выйти"}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
