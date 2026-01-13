"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/admin/StatCard";
import BooksPerGenreChart from "@/components/charts/BooksPerGenreChart";
import MonthlyBooksReadChart from "@/components/charts/MonthlyBooksReadChart";
import MonthlyPagesReadChart from "@/components/charts/MonthlyPagesReadChart";
import { adminApi } from "@/lib/adminApi";

export default function AdminDashboardPage() {
    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const [year, setYear] = useState(currentYear);

    const [stats, setStats] = useState(null);

    const [genreChart, setGenreChart] = useState([]);
    const [monthlyBooks, setMonthlyBooks] = useState([]);
    const [monthlyPages, setMonthlyPages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const load = async () => {
        setLoading(true);
        setErr("");

        try {
            const [s, g, mb, mp] = await Promise.all([
                adminApi.stats(),
                adminApi.booksPerGenre(),
                adminApi.monthlyBooksRead(year),
                adminApi.monthlyPagesRead(year),
            ]);

            setStats(s);
            setGenreChart(g?.chart || []);
            setMonthlyBooks(mb?.chart || []);
            setMonthlyPages(mp?.chart || []);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load admin dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (err) {
        return (
            <div className="alert alert-error">
                <span className="text-sm">{err}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Admin Overview</h1>
                    <p className="text-sm opacity-70">
                        System stats and reading activity insights.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="select select-bordered select-sm"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    >
                        <option value={currentYear}>{currentYear}</option>
                        <option value={currentYear - 1}>{currentYear - 1}</option>
                        <option value={currentYear - 2}>{currentYear - 2}</option>
                    </select>

                    <button className="btn btn-outline btn-sm" onClick={load}>
                        Refresh
                    </button>
                </div>
            </div>

            {/* stat grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Users" value={stats?.totalUsers} />
                <StatCard title="Total Books" value={stats?.totalBooks} />
                <StatCard title="Total Genres" value={stats?.totalGenres} />
                <StatCard title="Total Tutorials" value={stats?.totalTutorials} />
                <StatCard
                    title="Pending Reviews"
                    value={stats?.pendingReviews}
                    hint="Needs moderation"
                />
            </div>

            {/* charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BooksPerGenreChart data={genreChart} />
                <MonthlyBooksReadChart data={monthlyBooks} year={year} />
            </div>

            <MonthlyPagesReadChart data={monthlyPages} year={year} />
        </div>
    );
}
