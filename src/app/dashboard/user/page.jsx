"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function HomeDashboardPage() {
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const [library, setLibrary] = useState(null);
    const [loadingLibrary, setLoadingLibrary] = useState(true);

    const [recs, setRecs] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(true);

    const [msg, setMsg] = useState("");

    const loadStats = async () => {
        setLoadingStats(true);
        setMsg("");
        try {
            const res = await api.get("/dashboard/me/stats");
            setStats(res.data || null);
        } catch (e) {
            setStats(null);
            setMsg(e?.response?.data?.message || "Failed to load dashboard stats");
        } finally {
            setLoadingStats(false);
        }
    };

    // We use library to personalize recommendations
    const loadLibrary = async () => {
        setLoadingLibrary(true);
        try {
            // You already used /library/me earlier (from API_ROUTES in your code)
            const res = await api.get("/library/me");
            setLibrary(res.data || null);
        } catch {
            setLibrary(null);
        } finally {
            setLoadingLibrary(false);
        }
    };

    const loadRecommendations = async () => {
        setLoadingRecs(true);
        try {
            const favGenreIds = (stats?.favoriteGenres || []).map((g) => g.id).filter(Boolean);

            // if no favorite genre yet, fallback: top-rated books
            const genreParam = favGenreIds.length ? `&genre=${favGenreIds.join(",")}` : "";

            const res = await api.get(`/books?page=1&limit=24&sort=rating${genreParam}`);
            const all = res?.data?.result || [];

            const myBookIds = new Set(
                (library?.result || library || [])
                    .map((x) => x?.bookId)
                    .filter(Boolean)
            );

            // Exclude already shelved books
            const filtered = all.filter((b) => !myBookIds.has(b?._id));

            // Take first 9
            setRecs(filtered.slice(0, 9));
        } catch {
            setRecs([]);
        } finally {
            setLoadingRecs(false);
        }
    };

    const refreshAll = async () => {
        await loadStats();
        await loadLibrary();
    };

    useEffect(() => {
        refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Once stats + library available, compute recs
    useEffect(() => {
        if (loadingStats || loadingLibrary) return;
        loadRecommendations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingStats, loadingLibrary, stats, library]);

    const isLoading = loadingStats || loadingLibrary;

    const favGenres = useMemo(() => stats?.favoriteGenres || [], [stats]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-base-content">Home</h1>
                    <p className="text-sm opacity-70 mt-1">
                        Personalized recommendations and reading stats overview.
                    </p>
                </div>

                <button className="btn btn-outline" onClick={refreshAll} disabled={isLoading}>
                    Refresh
                </button>
            </div>

            {msg ? (
                <div className="alert">
                    <span className="text-sm">{msg}</span>
                </div>
            ) : null}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Reading"
                    value={stats?.readingCount ?? 0}
                    subtitle="Currently reading"
                    loading={loadingStats}
                />
                <StatCard
                    title="Completed"
                    value={stats?.readCount ?? 0}
                    subtitle="Books finished"
                    loading={loadingStats}
                />
                <StatCard
                    title="Pages Read"
                    value={stats?.totalPagesRead ?? 0}
                    subtitle="Including progress"
                    loading={loadingStats}
                />
                <StatCard
                    title="Avg Rating Given"
                    value={(stats?.avgRatingGiven ?? 0).toFixed(1)}
                    subtitle="All reviews you submitted"
                    loading={loadingStats}
                />
            </div>

            {/* Favorite genres */}
            <div className="card bg-base-100 border shadow-sm">
                <div className="card-body p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                            <h2 className="text-lg font-bold">Your Favorite Genres</h2>
                            <p className="text-sm opacity-70">
                                Based on your completed books.
                            </p>
                        </div>

                        <Link className="btn btn-sm btn-outline" href="/genres">
                            Browse Genres
                        </Link>
                    </div>

                    <div className="mt-4">
                        {loadingStats ? (
                            <div className="py-6 flex justify-center">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : favGenres.length === 0 ? (
                            <div className="alert">
                                <span className="text-sm">
                                    No favorite genres yet. Finish a few books to see insights here.
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {favGenres.map((g) => (
                                    <div key={g.id} className="badge badge-outline p-4">
                                        <span className="font-medium">{g.name}</span>
                                        <span className="opacity-70 ml-2">({g.count})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="card bg-base-100 border shadow-sm">
                <div className="card-body p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                            <h2 className="text-lg font-bold">Recommended For You</h2>
                            <p className="text-sm opacity-70">
                                Based on your favorite genres and top-rated books.
                            </p>
                        </div>

                        <Link className="btn btn-sm btn-primary" href="/dashboard/user/browse-books">
                            Explore Books
                        </Link>
                    </div>

                    <div className="mt-4">
                        {loadingRecs ? (
                            <div className="py-10 flex justify-center">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : recs.length === 0 ? (
                            <div className="alert">
                                <span className="text-sm">
                                    No recommendations right now. Try adding more books to your library.
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recs.map((b) => (
                                    <Link
                                        key={b._id}
                                        href={`/books/${b._id}`}
                                        className="card bg-base-100 border hover:shadow-md transition"
                                    >
                                        <div className="card-body p-4">
                                            <div className="flex gap-3">
                                                <div className="avatar">
                                                    <div className="w-14 h-16 rounded-lg overflow-hidden bg-base-200">
                                                        <img
                                                            src={b?.coverImage}
                                                            alt={b?.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold truncate">{b?.title}</p>
                                                    <p className="text-sm opacity-70 truncate">{b?.author}</p>

                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="badge badge-outline">
                                                            ⭐ {Number(b?.avgRating || 0).toFixed(1)}
                                                        </span>
                                                        <span className="badge badge-ghost">
                                                            Shelved: {b?.totalShelved || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {b.description ? (
                                                <p className="mt-3 text-sm opacity-80 line-clamp-2">
                                                    {b.description}
                                                </p>
                                            ) : null}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickLink
                    title="My Library"
                    desc="Manage shelves and track reading progress."
                    href="/dashboard/user/my-library"
                    btn="Open Library"
                />
                <QuickLink
                    title="Tutorials"
                    desc="Watch curated learning videos."
                    href="/dashboard/user/tutorials"
                    btn="Watch Tutorials"
                />
                <QuickLink
                    title="Browse Books"
                    desc="Find your next favorite book."
                    href="/dashboard/user/browse-books"
                    btn="Explore"
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, loading }) {
    return (
        <div className="card bg-base-100 border shadow-sm">
            <div className="card-body p-5">
                <p className="text-sm opacity-70">{title}</p>
                {loading ? (
                    <div className="mt-2">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                ) : (
                    <p className="text-3xl font-bold mt-1">{value}</p>
                )}
                <p className="text-xs opacity-60 mt-2">{subtitle}</p>
            </div>
        </div>
    );
}

function QuickLink({ title, desc, href, btn }) {
    return (
        <div className="card bg-base-100 border shadow-sm">
            <div className="card-body p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm opacity-70 mt-1">{desc}</p>
                <div className="mt-4">
                    <Link className="btn btn-sm btn-outline" href={href}>
                        {btn}
                    </Link>
                </div>
            </div>
        </div>
    );
}
