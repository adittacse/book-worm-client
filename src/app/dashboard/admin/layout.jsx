import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export const metadata = {
    title: "Admin Dashboard | BookWorm",
};

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-base-200">
            <div className="drawer lg:drawer-open">
                <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

                {/* content */}
                <div className="drawer-content flex flex-col">
                    <AdminTopbar />

                    <main className="p-4 md:p-6">
                        {children}
                    </main>
                </div>

                {/* sidebar */}
                <div className="drawer-side">
                    <label htmlFor="admin-drawer" className="drawer-overlay"></label>
                    <AdminSidebar />
                </div>
            </div>
        </div>
    );
}
