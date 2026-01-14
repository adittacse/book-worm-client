"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

export default function TutorialsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    const [visibleCount, setVisibleCount] = useState(12);

    const load = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await api.get("/tutorials");
            setItems(res.data || []);
        } catch (e) {
            setItems([]);
            setMsg(e?.response?.data?.message || "Failed to load tutorials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
    const hasMore = items.length > visibleCount;

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold">Tutorials</h1>
                    <p className="text-sm opacity-70 mt-1">
                        Watch curated videos to improve your skills.
                    </p>
                </div>

                <button className="btn btn-outline" onClick={load} disabled={loading}>
                    Refresh
                </button>
            </div>

            {msg ? (
                <div className="alert">
                    <span className="text-sm">{msg}</span>
                </div>
            ) : null}

            {loading ? (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : visible.length === 0 ? (
                <div className="text-center py-16 opacity-70">
                    No tutorials available right now.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {visible.map((t) => (
                            <div key={t._id} className="card bg-base-100 shadow-sm border">
                                <div className="card-body p-4">
                                    <h2 className="font-bold text-base leading-snug line-clamp-2">
                                        {t.title}
                                    </h2>

                                    <div className="mt-3 rounded-xl overflow-hidden border bg-base-200">
                                        <div className="relative w-full pt-[56.25%]">
                                            <iframe
                                                className="absolute inset-0 w-full h-full"
                                                src={`https://www.youtube.com/embed/${t.videoId}`}
                                                title={t.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <a
                                            className="link link-hover text-sm"
                                            href={t.youtubeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Open on YouTube
                                        </a>

                                        <span className="badge badge-outline">
                                            Video
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center pt-4">
                        {hasMore ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => setVisibleCount((v) => v + 12)}
                            >
                                Load more
                            </button>
                        ) : (
                            <p className="text-sm opacity-60">You’ve reached the end.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
