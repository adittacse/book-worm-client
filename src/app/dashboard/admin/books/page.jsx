"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Highest Rating" },
    { value: "shelved", label: "Most Shelved" },
];

export default function AdminBooksPage() {
    const router = useRouter();
    const sp = useSearchParams();

    const page = Number(sp.get("page") || 1);
    const limit = Number(sp.get("limit") || 10);
    const search = sp.get("search") || "";
    const sort = sp.get("sort") || "newest";

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [data, setData] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        result: [],
    });

    // delete modal state
    const [deleteId, setDeleteId] = useState(null);
    const [deleteTitle, setDeleteTitle] = useState("");
    const [deleting, setDeleting] = useState(false);

    // local input (so typing doesn't instantly hit query params)
    const [q, setQ] = useState(search);

    const setParams = (next) => {
        const params = new URLSearchParams(sp.toString());

        Object.entries(next).forEach(([k, v]) => {
            if (v === undefined || v === null || v === "") params.delete(k);
            else params.set(k, String(v));
        });

        router.push(`/dashboard/admin/books?${params.toString()}`);
    };

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/books", {
                params: { page, limit, search, sort },
            });
            setData(res.data);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load books");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, search, sort]);

    const books = useMemo(() => data?.result || [], [data]);

    const openDelete = (book) => {
        setDeleteId(book?._id);
        setDeleteTitle(book?.title || "this book");
        const modal = document.getElementById("bw_delete_book_modal");
        modal?.showModal?.();
    };

    const closeDelete = () => {
        setDeleteId(null);
        setDeleteTitle("");
        const modal = document.getElementById("bw_delete_book_modal");
        modal?.close?.();
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/books/${deleteId}`);
            closeDelete();

            // If last item deleted on last page, go back a page
            const isModalLastItem = books.length === 1 && page > 1;
            if (isModalLastItem) {
                setParams({ page: page - 1 });
            } else {
                await load();
            }
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to delete book");
        } finally {
            setDeleting(false);
        }
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        setParams({ search: q.trim(), page: 1 });
    };

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Manage Books</h1>
                    <p className="text-sm opacity-70">
                        Create, edit, search books and manage cover images.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/dashboard/admin/books/new" className="btn btn-primary">
                        + New Book
                    </Link>
                    <button className="btn btn-outline" onClick={load} disabled={loading}>
                        Refresh
                    </button>
                </div>
            </div>

            {err ? (
                <div className="alert alert-error">
                    <span className="text-sm">{err}</span>
                </div>
            ) : null}

            {/* Controls */}
            <div className="card bg-base-100 border">
                <div className="card-body p-4">
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
                            <input
                                className="input input-bordered w-72"
                                placeholder="Search by title or author..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                            <button className="btn btn-outline" type="submit">
                                Search
                            </button>
                            {search ? (
                                <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => {
                                        setQ("");
                                        setParams({ search: "", page: 1 });
                                    }}
                                >
                                    Clear
                                </button>
                            ) : null}
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                className="select select-bordered"
                                value={sort}
                                onChange={(e) => setParams({ sort: e.target.value, page: 1 })}
                            >
                                {SORT_OPTIONS.map((x) => (
                                    <option key={x.value} value={x.value}>
                                        Sort: {x.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="select select-bordered"
                                value={limit}
                                onChange={(e) => setParams({ limit: e.target.value, page: 1 })}
                            >
                                {[5, 10, 20, 50].map((x) => (
                                    <option key={x} value={x}>
                                        Per page: {x}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-3 text-sm opacity-70">
                        Total: <span className="font-medium">{data.total || 0}</span> books
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card bg-base-100 border">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-10 flex justify-center">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="p-10 text-center opacity-70">No books found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Sl.</th>
                                        <th>Book</th>
                                        <th>GenreId</th>
                                        <th>Pages</th>
                                        <th>Avg Rating</th>
                                        <th>Shelved</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {books.map((b, index) => (
                                    <tr key={b._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="w-10 h-14 rounded">
                                                        <img
                                                            src={b.coverImage}
                                                            alt={b.title}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{b.title}</div>
                                                    <div className="text-sm opacity-70">{b.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-mono text-xs">{b.genreId}</td>
                                        <td>{b.totalPages || 0}</td>
                                        <td>{Number(b.avgRating || 0).toFixed(1)}</td>
                                        <td>{b.totalShelved || 0}</td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/admin/books/${b._id}/edit`}
                                                    className="btn btn-sm btn-outline"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => openDelete(b)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="border-t p-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="text-sm opacity-70">
                        Page <span className="font-medium">{data.page}</span> of{" "}
                        <span className="font-medium">{data.totalPages}</span>
                    </div>

                    <div className="join">
                        <button
                            className="btn join-item"
                            disabled={data.page <= 1 || loading}
                            onClick={() => setParams({ page: data.page - 1 })}
                        >
                            Prev
                        </button>
                        <button className="btn join-item btn-ghost" disabled>
                            {data.page}
                        </button>
                        <button
                            className="btn join-item"
                            disabled={data.page >= data.totalPages || loading}
                            onClick={() => setParams({ page: data.page + 1 })}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <dialog id="bw_delete_book_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete book?</h3>
                    <p className="py-2 text-sm opacity-80">
                        Are you sure you want to delete <span className="font-semibold">{deleteTitle}</span>?
                        This action cannot be undone.
                    </p>

                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={closeDelete} disabled={deleting}>
                            Cancel
                        </button>
                        <button className="btn btn-error" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? <span className="loading loading-spinner loading-sm"></span> : null}
                            Delete
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeDelete}>close</button>
                </form>
            </dialog>
        </div>
    );
}
