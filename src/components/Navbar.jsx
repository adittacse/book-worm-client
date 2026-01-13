"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { data: session, status } = useSession();
    const role = session?.role;
    const pathname = usePathname();

    if (pathname.startsWith("/dashboard/admin")) {
        return <></>;
    }

    if (status === "loading") {
        return (
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start">
                    <span className="loading loading-spinner loading-sm"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <Link href="/" className="btn btn-ghost text-xl">
                    BookWorm
                </Link>
            </div>

            <div className="navbar-center hidden md:flex">
                {
                    role === "admin" ? (
                        <ul className="menu menu-horizontal px-1">
                            <li><Link href="/dashboard/admin">Dashboard</Link></li>
                            <li><Link href="/admin/books">Books</Link></li>
                            <li><Link href="/admin/genres">Genres</Link></li>
                            <li><Link href="/admin/reviews">Reviews</Link></li>
                            <li><Link href="/admin/users">Users</Link></li>
                            <li><Link href="/admin/tutorials">Tutorials</Link></li>
                        </ul>
                    ) : (
                        <ul className="menu menu-horizontal px-1">
                            <li><Link href="/dashboard">Home</Link></li>
                            <li><Link href="/browse-books">Browse Books</Link></li>
                            <li><Link href="/my-library">My Library</Link></li>
                            <li><Link href="/tutorials">Tutorials</Link></li>
                        </ul>
                    )
                }
            </div>

            <div className="navbar-end gap-2">
                {session?.user ? (
                    <>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="avatar">
                                <div className="w-9 rounded-full">
                                    <img
                                        src={session.user.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
                                        alt="user"
                                    />
                                </div>
                            </div>
                            <span className="text-sm opacity-80">{session.user.name || session.user.email}</span>
                        </div>

                        <button className="btn btn-sm btn-outline" onClick={() => signOut()}>
                            Logout
                        </button>
                    </>
                ) : (
                    <Link className="btn btn-sm btn-primary" href="/login">
                        Login
                    </Link>
                )}
            </div>
        </div>
    );
}
