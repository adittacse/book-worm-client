"use client";

import { useEffect, useMemo, useState } from "react";
import ReviewRow from "@/components/admin/ReviewRow";
import { reviewsAdminApi } from "@/lib/reviewsAdminApi";

const tabs = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
];

export default function ManageReviewsPage() {
    const [active, setActive] = useState("pending");

    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);

    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    const [busyIds, setBusyIds] = useState(() => new Set());

    const pendingCount = useMemo(() => pending.length, [pending]);
    const approvedCount = useMemo(() => approved.length, [approved]);

    const markBusy = (id, on) => {
        setBusyIds((prev) => {
            const next = new Set(prev);
            if (on) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const load = async () => {
        setLoading(true);
        setMsg("");
        try {
            const [p, a] = await Promise.all([
                reviewsAdminApi.pending(),
                reviewsAdminApi.approvedAll(),
            ]);

            const all = [...(p || []), ...(a || [])];
            const bookIds = all.map((x) => x.bookId);

            const books = await reviewsAdminApi.getBooksByIds(bookIds);

            // const titleMap = new Map(books.map((b) => [String(b._id), b.title]));
            // map by bookId
            const bookMap = new Map(
                books.map((b) => [
                    String(b._id),
                    {
                        title: b.title || "Unknown book",
                        author: b.author || "Unknown author",
                        coverImage: b.coverImage || "",
                    },
                ])
            );

            const enrich = (arr) =>
                (arr || []).map((r) => {
                    const b = bookMap.get(String(r.bookId));
                    return {
                        ...r,
                        book: b || { title: "Unknown book", author: "Unknown author", coverImage: "" },
                    };
                });

            setPending(enrich(p));
            setApproved(enrich(a));
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const approve = async (review) => {
        const id = review._id;
        setMsg("");
        markBusy(id, true);

        // optimistic move
        const prevPending = pending;
        const prevApproved = approved;

        setPending((cur) => cur.filter((r) => r._id !== id));
        setApproved((cur) => [{ ...review, status: "approved" }, ...cur]);

        try {
            const data = await reviewsAdminApi.approve(id);
            setMsg(data?.message || "Review approved");

            // sync approved list (safe)
            const a = await reviewsAdminApi.approvedAll();
            setApproved(Array.isArray(a) ? a : []);
        } catch (e) {
            // rollback
            setPending(prevPending);
            setApproved(prevApproved);
            setMsg(e?.response?.data?.message || "Approve failed");
        } finally {
            markBusy(id, false);
        }
    };

    const remove = async (review) => {
        const id = review._id;
        setMsg("");
        markBusy(id, true);

        const prevPending = pending;
        const prevApproved = approved;

        // optimistic remove (both lists)
        setPending((cur) => cur.filter((r) => r._id !== id));
        setApproved((cur) => cur.filter((r) => r._id !== id));

        try {
            const data = await reviewsAdminApi.remove(id);
            setMsg(data?.message || "Review deleted");
        } catch (e) {
            // rollback
            setPending(prevPending);
            setApproved(prevApproved);
            setMsg(e?.response?.data?.message || "Delete failed");
        } finally {
            markBusy(id, false);
        }
    };

    const list = active === "pending" ? pending : approved;

    return (
        <div className="space-y-5">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Manage Reviews</h1>
                    <p className="text-sm text-base-content/70">
                        Approve pending reviews and manage approved reviews.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="badge badge-outline">Pending: {loading ? "…" : pendingCount}</div>
                    <div className="badge badge-outline">Approved: {loading ? "…" : approvedCount}</div>

                    <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-xs"></span> : null}
                        Refresh
                    </button>
                </div>
            </div>

            {msg ? (
                <div className="alert mt-4">
                    <span className="text-sm text-base-content">{msg}</span>
                </div>
            ) : null}

            <div className="mt-5 tabs tabs-boxed">
                {tabs.map((t) => (
                    <a
                        key={t.key}
                        className={`tab ${active === t.key ? "tab-active" : ""}`}
                        onClick={() => setActive(t.key)}
                    >
                        {t.label}
                    </a>
                ))}
            </div>

            <div className="mt-6 card bg-base-100 shadow">
                <div className="card-body">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="py-10 text-center text-base-content/70">
                            {active === "pending" ? "No pending reviews right now." : "No approved reviews yet."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                <tr className="text-base-content/70">
                                    <th>User</th>
                                    <th>Book</th>
                                    <th>Rating</th>
                                    <th>Review</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {list.map((r) => (
                                    <ReviewRow
                                        key={r._id}
                                        review={r}
                                        busy={busyIds.has(r._id)}
                                        showApprove={active === "pending"}
                                        onApprove={() => approve(r)}
                                        onDelete={() => remove(r)}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
