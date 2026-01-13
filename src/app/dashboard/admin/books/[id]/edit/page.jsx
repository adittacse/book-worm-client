"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminEditBookPage() {
    const { id } = useParams();
    const router = useRouter();

    const [genres, setGenres] = useState([]);
    const [loadingGenres, setLoadingGenres] = useState(true);

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [genreId, setGenreId] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [totalPages, setTotalPages] = useState("");

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const loadGenres = async () => {
        setLoadingGenres(true);
        try {
            const res = await api.get("/genres");
            setGenres(res.data || []);
        } catch (e) {
            setGenres([]);
            setMsg(e?.response?.data?.message || "Failed to load genres");
        } finally {
            setLoadingGenres(false);
        }
    };

    const loadBook = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await api.get(`/books/${id}`);
            const b = res.data;
            setBook(b);

            setTitle(b?.title || "");
            setAuthor(b?.author || "");
            setGenreId(b?.genreId || "");
            setDescription(b?.description || "");
            setCoverImage(b?.coverImage || "");
            setTotalPages(String(b?.totalPages ?? ""));
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to load book");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGenres();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!id) return;
        loadBook();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();
        setMsg("");

        setSaving(true);
        try {
            await api.patch(`/books/${id}`, {
                title: title.trim(),
                author: author.trim(),
                genreId,
                description: description.trim(),
                coverImage: coverImage.trim(),
                totalPages: totalPages === "" ? 0 : Number(totalPages),
            });

            router.push("/dashboard/admin/books");
        } catch (e2) {
            setMsg(e2?.response?.data?.message || "Failed to update book");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 flex justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="space-y-4">
                <div className="alert alert-error">
                    <span className="text-sm">{msg || "Book not found"}</span>
                </div>
                <Link className="btn btn-outline" href="/dashboard/admin/books">
                    Back to Books
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Edit Book</h1>
                    <p className="text-sm opacity-70">
                        Update details, cover image and genre.
                    </p>
                </div>
                <Link className="btn btn-outline" href="/dashboard/admin/books">
                    Back to Books
                </Link>
            </div>

            {msg ? (
                <div className="alert">
                    <span className="text-sm">{msg}</span>
                </div>
            ) : null}

            <form onSubmit={submit} className="card bg-base-100 border">
                <div className="card-body space-y-4">
                    {/* preview */}
                    <div className="flex items-start gap-4">
                        <div className="avatar">
                            <div className="w-24 h-32 rounded">
                                <img
                                    src={
                                        coverImage.trim() ||
                                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                                    }
                                    alt="cover preview"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex-1 text-sm opacity-70">
                            Book ID: <span className="font-mono text-xs">{book?._id}</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Title</span>
                            </div>
                            <input
                                className="input input-bordered"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Book title"
                            />
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Author</span>
                            </div>
                            <input
                                className="input input-bordered"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Author name"
                            />
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Genre</span>
                            </div>
                            <select
                                className="select select-bordered"
                                value={genreId}
                                onChange={(e) => setGenreId(e.target.value)}
                                disabled={loadingGenres}
                            >
                                {genres.length === 0 ? <option value="">No genres</option> : null}
                                {genres.map((g) => (
                                    <option key={g._id} value={g._id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Total Pages</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                className="input input-bordered"
                                value={totalPages}
                                onChange={(e) => setTotalPages(e.target.value)}
                                placeholder="e.g. 320"
                            />
                        </label>
                    </div>

                    <label className="form-control">
                        <div className="label">
                            <span className="label-text">Cover Image URL</span>
                        </div>
                        <input
                            className="input input-bordered"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://..."
                        />
                    </label>

                    <label className="form-control">
                        <div className="label">
                            <span className="label-text">Description</span>
                        </div>
                        <textarea
                            className="textarea textarea-bordered"
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Book description..."
                        />
                    </label>

                    <div className="flex items-center justify-end gap-2">
                        <Link className="btn btn-ghost" href="/dashboard/admin/books">
                            Cancel
                        </Link>
                        <button className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="loading loading-spinner loading-sm"></span> : null}
                            Save Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
