"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminTopbar() {
    const { data: session } = useSession();

    return (
        <div className="navbar bg-base-100 border-b">
            <div className="flex-none lg:hidden">
                <label htmlFor="admin-drawer" className="btn btn-ghost btn-square">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </label>
            </div>

            <div className="flex-1">
                <Link href="/dashboard/admin" className="btn btn-ghost text-xl">
                    BookWorm Admin
                </Link>
            </div>

            <div className="flex-none gap-2">
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
