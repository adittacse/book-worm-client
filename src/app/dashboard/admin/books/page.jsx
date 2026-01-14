import { Suspense } from "react";
import AdminBooksClient from "./AdminBooksClient";

export default function Page() {
    return (
        <Suspense fallback={<div className="p-10 flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
        </div>}>
            <AdminBooksClient />
        </Suspense>
    );
}
