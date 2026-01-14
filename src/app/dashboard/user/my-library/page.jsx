"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

const shelfTabs = [
    { key: "want", label: "Want to Read" },
    { key: "reading", label: "Currently Reading" },
    { key: "read", label: "Read" },
];

export default function MyLibraryPage() {
    const [items, setItems] = useState([]);
    const [active, setActive] = useState("want");
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const [progressDraft, setProgressDraft] = useState({});

    const load = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await api.get("/library/me");
            const data = res.data || [];
            setItems(data);

            const draft = {};
            data.forEach((it) => {
                draft[it._id] = it.pagesRead ?? 0;
            });
            setProgressDraft(draft);
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to load library");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        return items.filter((x) => x.shelf === active);
    }, [items, active]);

    const moveShelf = async (bookId, shelf) => {
        setMsg("");
        try {
            await api.post("/library", { bookId, shelf });
            await load();
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to update shelf");
        }
    };

    const updateProgress = async (libraryId, pagesRead) => {
        setMsg("");

        const p = Number(pagesRead);
        if (Number.isNaN(p) || p < 0) {
            setMsg("Invalid pages");
            return;
        }

        try {
            await api.patch(`/library/${libraryId}/progress`, { pagesRead: p });

            // better UX: local update first (instant), then reload
            setItems((prev) =>
                prev.map((it) => (it._id === libraryId ? { ...it, pagesRead: p } : it))
            );

            await load();
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to update progress");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">My Library</h1>
                    <p className="text-sm opacity-70">Manage shelves and track your progress.</p>
                </div>
                <button className="btn btn-outline" onClick={load} disabled={loading}>
                    Refresh
                </button>
            </div>

            {msg ? (
                <div className="alert mt-4">
                    <span className="text-sm">{msg}</span>
                </div>
            ) : null}

            <div className="mt-4 tabs tabs-boxed">
                {shelfTabs.map((t) => (
                    <a
                        key={t.key}
                        className={`tab ${active === t.key ? "tab-active" : ""}`}
                        onClick={() => setActive(t.key)}
                    >
                        {t.label}
                    </a>
                ))}
            </div>

            {loading ? (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 opacity-70">No books in this shelf.</div>
            ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((x) => (
                        <div key={x._id} className="card bg-base-100 shadow">
                            <div className="card-body">
                                <div className="flex gap-4">
                                    <Image width={80} height={104}
                                        src={x.book?.coverImage}
                                        alt={x.book?.title}
                                        className="w-20 h-28 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <Link href={`/books/${x.bookId}`} className="font-bold text-lg link link-hover">
                                            {x.book?.title || "Book"}
                                        </Link>
                                        <p className="text-sm opacity-70">{x.book?.author}</p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button className="btn btn-xs btn-outline" onClick={() => moveShelf(x.bookId, "want")}>
                                                Want
                                            </button>
                                            <button className="btn btn-xs btn-outline" onClick={() => moveShelf(x.bookId, "reading")}>
                                                Reading
                                            </button>
                                            <button className="btn btn-xs btn-outline" onClick={() => moveShelf(x.bookId, "read")}>
                                                Read
                                            </button>
                                        </div>

                                        {/* progress only for reading */}
                                        {x.shelf === "reading" ? (
                                            <div className="mt-4">
                                                <p className="text-sm opacity-70">
                                                    Progress: {x.pagesRead || 0}/{x.book?.totalPages || 0} pages
                                                </p>

                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        className="input input-bordered input-sm w-full"
                                                        type="number"
                                                        min="0"
                                                        placeholder="Pages read..."
                                                        value={progressDraft[x._id] ?? 0}
                                                        onChange={(e) =>
                                                            setProgressDraft((prev) => ({
                                                                ...prev,
                                                                [x._id]: e.target.value,
                                                            }))
                                                        }
                                                    />

                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => updateProgress(x._id, progressDraft[x._id])}
                                                        type="button"
                                                    >
                                                        Save
                                                    </button>
                                                </div>

                                                <progress
                                                    className="progress progress-primary mt-2"
                                                    value={x?.percent || 0}
                                                    max="100"
                                                ></progress>
                                                <p className="text-xs opacity-60 mt-1">{x?.percent || 0}%</p>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
