"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

export default function AdminGenresPage() {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    const [q, setQ] = useState("");

    // add/edit modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState("add"); // "add" | "edit"
    const [activeId, setActiveId] = useState(null);

    const [name, setName] = useState("");

    // ui feedback
    const [busyId, setBusyId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const openAdd = () => {
        setMode("add");
        setActiveId(null);
        setName("");
        setMsg("");
        setModalOpen(true);
    };

    const openEdit = (g) => {
        setMode("edit");
        setActiveId(g?._id);
        setName(g?.name || "");
        setMsg("");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setMode("add");
        setActiveId(null);
        setName("");
    };

    const load = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await api.get("/genres");
            setGenres(res.data || []);
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to load genres");
            setGenres([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return genres;
        return genres.filter((g) => String(g?.name || "").toLowerCase().includes(s));
    }, [genres, q]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg("");

        const clean = name.trim();
        if (!clean) {
            setMsg("Genre name is required");
            return;
        }

        // simple client-side duplicate check (backend should still enforce)
        const duplicate = genres.some(
            (g) =>
                String(g?._id) !== String(activeId) &&
                String(g?.name || "").trim().toLowerCase() === clean.toLowerCase()
        );
        if (duplicate) {
            setMsg("This genre already exists");
            return;
        }

        setSaving(true);

        try {
            if (mode === "add") {
                const res = await api.post("/genres", { name: clean });

                // optimistic insert if backend returns inserted doc; else reload
                const created = res?.data?.genre || res?.data?.result || null;

                if (created && created._id) {
                    setGenres((prev) => [{ _id: created._id, name: created.name || clean }, ...prev]);
                } else {
                    await load();
                }

                closeModal();
            } else {
                const res = await api.patch(`/genres/${activeId}`, { name: clean });

                // optimistic update
                setGenres((prev) =>
                    prev.map((g) => (String(g._id) === String(activeId) ? { ...g, name: clean } : g))
                );

                // if backend provides canonical name, apply it
                const updatedName = res?.data?.genre?.name;
                if (updatedName) {
                    setGenres((prev) =>
                        prev.map((g) =>
                            String(g._id) === String(activeId) ? { ...g, name: updatedName } : g
                        )
                    );
                }

                closeModal();
            }
        } catch (e2) {
            setMsg(e2?.response?.data?.message || "Operation failed");
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (g) => {
        setMsg("");
        if (!g?._id) return;

        const ok = window.confirm(`Delete genre "${g.name}"?`);
        if (!ok) return;

        setBusyId(g._id);

        // optimistic remove (revert if failed)
        const snapshot = genres;
        setGenres((prev) => prev.filter((x) => String(x._id) !== String(g._id)));

        try {
            // DELETE /genres/:id
            await api.delete(`/genres/${g._id}`);
            // done
        } catch (e) {
            // revert
            setGenres(snapshot);

            // If genre is used, backend should respond with a message.
            // Example: "Cannot delete. Genre is used by 12 books."
            setMsg(e?.response?.data?.message || "Failed to delete genre");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Manage Genres</h1>
                    <p className="text-sm opacity-70">
                        Create, edit, and delete genres. If a genre is used by books, delete will be blocked.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="btn btn-outline" onClick={load} disabled={loading}>
                        Refresh
                    </button>
                    <button className="btn btn-primary" onClick={openAdd}>
                        + Add Genre
                    </button>
                </div>
            </div>

            {msg ? (
                <div className="alert alert-error mt-4">
                    <span className="text-sm">{msg}</span>
                </div>
            ) : null}

            <div className="mt-5 flex items-center gap-3 flex-wrap">
                <label className="input input-bordered flex items-center gap-2 w-full md:w-96">
                    <span className="opacity-60 text-sm">Search</span>
                    <input
                        className="grow"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Type a genre name..."
                    />
                </label>

                <div className="badge badge-outline">
                    Total: {genres.length}
                </div>
                <div className="badge badge-outline">
                    Showing: {filtered.length}
                </div>
            </div>

            <div className="mt-5">
                {loading ? (
                    <div className="min-h-[45vh] flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <p className="opacity-70">No genres found.</p>
                            <button className="btn btn-primary w-fit" onClick={openAdd}>
                                Add your first genre
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-base-100 rounded-xl shadow">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Sl.</th>
                                    <th>Genre Name</th>
                                    <th>Genre ID</th>
                                    <th className="w-40">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filtered.map((g, index) => (
                                <tr key={g._id}>
                                    <td>{index + 1}</td>

                                    <td className="font-medium">{g.name}</td>

                                    <td className="text-[11px] opacity-50 mt-1">
                                        {String(g._id)}
                                    </td>

                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn btn-sm btn-outline" onClick={() => openEdit(g)}>
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => onDelete(g)}
                                                disabled={busyId === g._id}
                                            >
                                                {busyId === g._id ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : null}
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

            {/* Add/Edit Modal */}
            {modalOpen ? (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            {mode === "add" ? "Add Genre" : "Edit Genre"}
                        </h3>
                        <p className="text-sm opacity-70 mt-1">
                            {mode === "add"
                                ? "Create a new genre for categorizing books."
                                : "Update the genre name."}
                        </p>

                        <form onSubmit={onSubmit} className="mt-5 space-y-3">
                            <label className="form-control w-full">
                                <div className="label">
                                    <span className="label-text">Genre Name</span>
                                </div>
                                <input
                                    className="input input-bordered w-full"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Fiction"
                                    autoFocus
                                />
                            </label>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button className="btn btn-primary" disabled={saving}>
                                    {saving ? <span className="loading loading-spinner loading-xs"></span> : null}
                                    {mode === "add" ? "Create" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="modal-backdrop" onClick={closeModal}></div>
                </div>
            ) : null}
        </div>
    );
}
