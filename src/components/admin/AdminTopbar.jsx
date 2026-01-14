"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/dashboard/admin/books", label: "Manage Books" },
    { href: "/dashboard/admin/genres", label: "Manage Genres" },
    { href: "/dashboard/admin/reviews", label: "Moderate Reviews" },
    { href: "/dashboard/admin/tutorials", label: "Manage Tutorials" },
    { href: "/dashboard/admin/users", label: "Manage Users" },
];

export default function AdminTopbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className="navbar bg-base-100 border-b">
            <div className="navbar-start">
                <Link href="/" className="btn btn-ghost text-xl">
                    BookWorm Admin
                </Link>
            </div>

            <div className="navbar-center hidden md:flex">
                <ul className="menu menu-horizontal px-1">
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
            </div>

            <div className="navbar-end gap-2">
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold">{session?.user?.name || "Admin"}</p>
                    <p className="text-xs opacity-60">{session?.user?.email}</p>
                </div>

                <button className="btn btn-outline btn-sm" onClick={() => signOut({ callbackUrl: "/login" })}>
                    Logout
                </button>
            </div>
        </div>
    );
}
