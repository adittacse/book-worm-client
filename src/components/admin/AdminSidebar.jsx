"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/books", label: "Manage Books" },
    { href: "/dashboard/admin/genres", label: "Manage Genres" },
    { href: "/dashboard/admin/users", label: "Manage Users" },
    { href: "/dashboard/admin/reviews", label: "Moderate Reviews" },
    { href: "/dashboard/admin/tutorials", label: "Manage Tutorials" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 min-h-full bg-base-100 border-r">
            <div className="p-4 border-b">
                <p className="font-bold text-lg">Admin Panel</p>
                <p className="text-xs opacity-60">BookWorm Management</p>
            </div>

            <ul className="menu p-3">
                {links.map((l) => {
                    const active = pathname === l.href;
                    return (
                        <li key={l.href}>
                            <Link className={active ? "active font-semibold" : ""} href={l.href}>
                                {l.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="p-4 border-t mt-auto">
                <Link href="/my-library" className="btn btn-ghost btn-sm w-full justify-start">
                    Back to User App
                </Link>
            </div>
        </aside>
    );
}
