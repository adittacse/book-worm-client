"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

export default function AdminTutorialsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    // create form
    const [title, setTitle] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [saving, setSaving] = useState(false);

    // edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editing, setEditing] = useState(false);

    // delete confirm
    const [delOpen, setDelOpen] = useState(false);
    const [delTarget, setDelTarget] = useState(null); // { _id, title }
    const [deleting, setDeleting] = useState(false);

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

    const create = async (e) => {
        e.preventDefault();
        setMsg("");

        if (!title.trim() || !youtubeUrl.trim()) {
            setMsg("Title and YouTube URL are required.");
            return;
        }

        setSaving(true);
        try {
            await api.post("/tutorials", {
                title: title.trim(),
                youtubeUrl: youtubeUrl.trim(),
            });

            setTitle("");
            setYoutubeUrl("");
            await load();
        } catch (e2) {
            setMsg(e2?.response?.data?.message || "Failed to add tutorial");
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (t) => {
        setMsg("");
        setEditId(t._id);
        setEditTitle(t.title || "");
        setEditUrl(t.youtubeUrl || "");
        setEditOpen(true);
    };

    const closeEdit = () => {
        if (editing) return;
        setEditOpen(false);
        setEditId("");
        setEditTitle("");
        setEditUrl("");
    };

    const update = async () => {
        setMsg("");

        if (!editId) return;

        if (!editTitle.trim() && !editUrl.trim()) {
            setMsg("Nothing to update.");
            return;
        }

        setEditing(true);
        try {
            await api.patch(`/tutorials/${editId}`, {
                title: editTitle.trim(),
                youtubeUrl: editUrl.trim(),
            });
            closeEdit();
            await load();
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to update tutorial");
        } finally {
            setEditing(false);
        }
    };

    const openDelete = (t) => {
        setMsg("");
        setDelTarget({ _id: t._id, title: t.title || "Tutorial" });
        setDelOpen(true);
    };

    const closeDelete = () => {
        if (deleting) return;
        setDelOpen(false);
        setDelTarget(null);
    };

    const remove = async () => {
        if (!delTarget?._id) return;

        setDeleting(true);
        setMsg("");
        try {
            await api.delete(`/tutorials/${delTarget._id}`);
            closeDelete();
            await load();
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to delete tutorial");
        } finally {
            setDeleting(false);
        }
    };

    const total = useMemo(() => items.length, [items]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-base-content">Manage Tutorials</h1>
                    <p className="text-sm opacity-70 mt-1">
                        Add YouTube videos on book recommendations for users. You can edit or remove anytime.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="btn btn-outline btn-sm">Total: {total}</div>
                    <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
                        Refresh
                    </button>
                </div>
            </div>

            {msg ? (
                <div className="alert">
                    <span className="text-sm">{msg}</span>
                </div>
            ) : null}

            {/* Create form */}
            <form onSubmit={create} className="card bg-base-100 shadow-sm border">
                <div className="card-body p-5 md:p-7 space-y-4">
                    <h2 className="text-lg font-bold">Add new tutorial</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text font-medium">Title</span>
                            </div>
                            <input
                                className="input input-bordered w-full"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. React Query Crash Course"
                            />
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text font-medium">YouTube URL</span>
                            </div>
                            <input
                                className="input input-bordered w-full"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => {
                                setTitle("");
                                setYoutubeUrl("");
                                setMsg("");
                            }}
                            disabled={saving}
                        >
                            Clear
                        </button>

                        <button className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="loading loading-spinner loading-sm"></span> : null}
                            Add Tutorial
                        </button>
                    </div>
                </div>
            </form>

            {/* List */}
            <div className="card bg-base-100 shadow-sm border">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                            <tr>
                                <th className="w-16">Sl.</th>
                                <th>Title</th>
                                <th>YouTube URL</th>
                                <th className="w-40 text-right">Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center opacity-70">
                                        No tutorials found.
                                    </td>
                                </tr>
                            ) : (
                                items.map((t, idx) => (
                                    <tr key={t._id}>
                                        <td>{idx + 1}</td>
                                        <td className="font-medium">{t.title}</td>
                                        <td className="max-w-[520px] truncate font-mono text-xs opacity-80">
                                            {t.youtubeUrl}
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    type="button"
                                                    onClick={() => openEdit(t)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-error"
                                                    type="button"
                                                    onClick={() => openDelete(t)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editOpen ? (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Edit Tutorial</h3>

                        <div className="mt-4 space-y-3">
                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text">Title</span>
                                </div>
                                <input
                                    className="input input-bordered w-full"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text">YouTube URL</span>
                                </div>
                                <input
                                    className="input input-bordered w-full"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={closeEdit} disabled={editing}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={update} disabled={editing}>
                                {editing ? <span className="loading loading-spinner loading-sm"></span> : null}
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="modal-backdrop" onClick={closeEdit}></div>
                </div>
            ) : null}

            {/* Delete Confirm */}
            {delOpen ? (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete tutorial?</h3>
                        <p className="py-3 text-sm opacity-80">
                            This will permanently remove{" "}
                            <span className="font-semibold">{delTarget?.title}</span>.
                        </p>

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={closeDelete} disabled={deleting}>
                                Cancel
                            </button>
                            <button className="btn btn-error" onClick={remove} disabled={deleting}>
                                {deleting ? <span className="loading loading-spinner loading-sm"></span> : null}
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={closeDelete}></div>
                </div>
            ) : null}
        </div>
    );
}
