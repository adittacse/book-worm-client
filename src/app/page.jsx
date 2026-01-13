import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
    const session = await getServerSession(authOptions);

    // not logged in
    if (!session) {
        redirect("/login");
    }

    // admin vs user
    if (session.role === "admin") {
        redirect("/admin/dashboard");
    } else {
        redirect("/my-library");
    }
}
