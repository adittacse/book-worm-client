"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { toQuery } from "@/lib/q";
import Link from "next/link";

export default function BrowseBooksPage() {
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    const [search, setSearch] = useState("");
    const [minRating, setMinRating] = useState("");
    const [maxRating, setMaxRating] = useState("");
    const [sort, setSort] = useState("newest");

    const [page, setPage] = useState(1);
    const limit = 9;

    const [data, setData] = useState({ result: [], total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // load genres once
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/genres");
                setGenres(res.data || []);
            } catch {
                // error message
            }
        })();
    }, []);

    const genreIdToName = useMemo(() => {
        const map = {};
        genres.forEach((g) => (map[g._id] = g.name));
        return map;
    }, [genres]);

    const fetchBooks = async (pg = 1) => {
        setLoading(true);
        setErr("");

        try {
            const qs = toQuery({
                page: pg,
                limit,
                search,
                genre: selectedGenres, // backend expects "genre=id1,id2"
                minRating,
                maxRating,
                sort,
            });

            const res = await api.get(`/books?${qs}`);
            setData(res.data);
            setPage(pg);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load books");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort]);

    const toggleGenre = (id) => {
        setSelectedGenres((prev) => {
            const exists = prev.includes(id);
            const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
            return next;
        });
    };

    const applyFilters = () => {
        fetchBooks(1);
    };

    const resetFilters = () => {
        setSearch("");
        setSelectedGenres([]);
        setMinRating("");
        setMaxRating("");
        setSort("newest");
        fetchBooks(1);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Browse Books</h1>
                    <p className="text-sm opacity-70">Search, filter, and discover your next read.</p>
                </div>

                <button className="btn btn-outline" onClick={resetFilters}>
                    Reset
                </button>
            </div>

            {/* Filters */}
            <div className="mt-4 card bg-base-100 shadow">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <label className="form-control">
                            <div className="label"><span className="label-text">Search</span></div>
                            <input
                                className="input input-bordered"
                                placeholder="Title or author..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            />
                        </label>

                        <label className="form-control">
                            <div className="label"><span className="label-text">Min Rating</span></div>
                            <input
                                className="input input-bordered"
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                placeholder="e.g. 3.5"
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                            />
                        </label>

                        <label className="form-control">
                            <div className="label"><span className="label-text">Max Rating</span></div>
                            <input
                                className="input input-bordered"
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                placeholder="e.g. 5"
                                value={maxRating}
                                onChange={(e) => setMaxRating(e.target.value)}
                            />
                        </label>

                        <label className="form-control">
                            <div className="label"><span className="label-text">Sort</span></div>
                            <select
                                className="select select-bordered"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="newest">Newest</option>
                                <option value="rating">Top Rated</option>
                                <option value="shelved">Most Shelved</option>
                            </select>
                        </label>
                    </div>

                    {/* Genre multi select */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">Genres</p>
                            <button className="btn btn-primary btn-sm" onClick={applyFilters} disabled={loading}>
                                {
                                    loading ? <span className="loading loading-spinner loading-xs"></span> : null
                                }
                                Apply
                            </button>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {
                                genres.length === 0 ? (
                                    <span className="text-sm opacity-60">No genres loaded.</span>
                                ) : (
                                    genres.map((g) => {
                                        const active = selectedGenres.includes(g._id);
                                        return (
                                            <button
                                                key={g._id}
                                                type="button"
                                                className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
                                                onClick={() => toggleGenre(g._id)}
                                            >
                                                {g.name}
                                            </button>
                                        );
                                    })
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {
                err ? (
                    <div className="alert alert-error mt-4">
                        <span>{err}</span>
                    </div>
                ) : null
            }

            {/* List */}
            <div className="mt-6">
                {
                    loading ? (
                        <div className="min-h-[40vh] flex items-center justify-center">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : data?.result?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.result.map((b) => (
                                <Link key={b._id} href={`/books/${b._id}`} className="card bg-base-100 shadow hover:shadow-md transition">
                                    <figure className="px-4 pt-4">
                                        <img
                                            src={b?.coverImage}
                                            alt={b?.title}
                                            className="rounded-xl h-56 w-full object-cover"
                                        />
                                    </figure>
                                    <div className="card-body">
                                        <h2 className="card-title line-clamp-1">{b?.title}</h2>
                                        <p className="text-sm opacity-70 line-clamp-1">{b?.author}</p>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="badge badge-outline">
                                              {
                                                  genreIdToName[b?.genreId] || "Genre"
                                              }
                                            </span>
                                            <div className="text-sm opacity-80">
                                                {
                                                    Number(b?.avgRating || 0).toFixed(1)
                                                }
                                            </div>
                                        </div>

                                        <div className="mt-2 text-xs opacity-60">
                                            Shelved: {b?.totalShelved || 0}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 opacity-70">No books found.</div>
                    )
                }
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
                <div className="join">
                    <button
                        className="btn join-item"
                        disabled={page <= 1 || loading}
                        onClick={() => fetchBooks(page - 1)}
                    >
                        Prev
                    </button>

                    <button className="btn join-item btn-ghost">
                        Page {page} / {data.totalPages || 1}
                    </button>

                    <button
                        className="btn join-item"
                        disabled={page >= (data.totalPages || 1) || loading}
                        onClick={() => fetchBooks(page + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
