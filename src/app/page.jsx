import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
    const session = await getServerSession(authOptions);

    // not logged in
    if (!session) {
        redirect("/login");
    }

    const role = session?.user?.role || session?.role;

    // admin vs user
    if (role === "admin") {
        redirect("/dashboard/admin");
    } else {
        redirect("/dashboard/user/my-library");
    }
}
