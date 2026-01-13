"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Protect({ children, role }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "loading") {
            return;
        }

        if (!session) {
            router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
            return;
        }

        if (role && session.role !== role) {
            router.replace("/forbidden");
        }
    }, [session, status, role, router, pathname]);

    if (status === "loading") {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    if (role && session.role !== role) {
        return null;
    }

    return children;
}
