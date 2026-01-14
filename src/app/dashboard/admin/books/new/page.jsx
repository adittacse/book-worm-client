"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminNewBookPage() {
    const router = useRouter();

    const [genres, setGenres] = useState([]);
    const [loadingGenres, setLoadingGenres] = useState(true);

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
            const list = res.data || [];
            setGenres(list);

            if (!genreId && list.length > 0) {
                setGenreId(list[0]._id);
            }
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to load genres");
            setGenres([]);
        } finally {
            setLoadingGenres(false);
        }
    };

    useEffect(() => {
        loadGenres();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setMsg("");

        // basic client checks (backend will validate anyway)
        if (!title.trim() || !author.trim() || !genreId || !description.trim() || !coverImage.trim()) {
            setMsg("Please fill all required fields (title, author, genre, description, cover image).");
            return;
        }

        setSaving(true);
        try {
            await api.post("/books", {
                title: title.trim(),
                author: author.trim(),
                genreId,
                description: description.trim(),
                coverImage: coverImage.trim(),
                totalPages: totalPages ? Number(totalPages) : 0,
            });

            router.push("/dashboard/admin/books");
        } catch (e2) {
            setMsg(e2?.response?.data?.message || "Failed to create book");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-base-content">Add New Book</h1>
                    <p className="text-sm opacity-70 mt-1">
                        Create a new book with cover image and genre.
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

            <form onSubmit={submit} className="card bg-base-100 shadow-sm border">
                <div className="card-body p-5 md:p-7 space-y-6">
                    {/* Top: Cover + Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cover card */}
                        <div className="card bg-base-200 border">
                            <div className="card-body p-4">
                                <div className="flex mx-auto w-64 h-72 rounded-xl overflow-hidden bg-base-300 ring-1 ring-base-300 shrink-0">
                                    <img
                                        src={
                                            coverImage.trim() ||
                                            "https://placehold.co/600x800?text=No+Cover"
                                        }
                                        alt="cover preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="divider my-3"></div>

                                {/* Placeholder meta cards (same vibe as Edit page) */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="p-3 rounded-lg bg-base-100 border text-center">
                                        <p className="text-xs opacity-70">Avg Rating</p>
                                        <p className="text-lg font-bold">0.0</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-base-100 border text-center">
                                        <p className="text-xs opacity-70">Shelved</p>
                                        <p className="text-lg font-bold">0</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form fields */}
                        <div className="lg:col-span-2 space-y-5">
                            <div className="grid md:grid-cols-2 gap-4">
                                <label className="form-control flex flex-col">
                                    <div className="label mb-2">
                                        <span className="label-text font-medium">Title</span>
                                    </div>
                                    <input
                                        className="input input-bordered w-full"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Book title"
                                        required
                                    />
                                </label>

                                <label className="form-control flex flex-col">
                                    <div className="label mb-2">
                                        <span className="label-text font-medium">Author</span>
                                    </div>
                                    <input
                                        className="input input-bordered w-full"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Author name"
                                        required
                                    />
                                </label>

                                <label className="form-control flex flex-col">
                                    <div className="label mb-2">
                                        <span className="label-text font-medium">Genre</span>
                                    </div>
                                    <select
                                        className="select select-bordered w-full"
                                        value={genreId}
                                        onChange={(e) => setGenreId(e.target.value)}
                                        disabled={loadingGenres}
                                        required
                                    >
                                        {loadingGenres ? <option value="">Loading...</option> : null}
                                        {!loadingGenres && genres.length === 0 ? (
                                            <option value="">No genres</option>
                                        ) : null}
                                        {genres.map((g) => (
                                            <option key={g._id} value={g._id}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-control flex flex-col">
                                    <div className="label mb-2">
                                        <span className="label-text font-medium">Total Pages</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input input-bordered w-full"
                                        value={totalPages}
                                        onChange={(e) => setTotalPages(e.target.value)}
                                        placeholder="e.g. 320"
                                    />
                                </label>
                            </div>

                            {/* Cover URL + Tip card */}
                            <div className="flex flex-col">
                                <label className="form-control md:col-span-2 mb-5">
                                    <div className="label mb-2">
                                        <span className="label-text font-medium">Cover Image URL</span>
                                        <span className="label-text-alt opacity-70">
                                            Used in lists + details
                                        </span>
                                    </div>
                                    <input
                                        className="input input-bordered w-full"
                                        value={coverImage}
                                        onChange={(e) => setCoverImage(e.target.value)}
                                        placeholder="https://..."
                                        required
                                    />
                                </label>

                                <div className="card bg-base-200 border">
                                    <p className="p-4">
                                        <span className="font-semibold">Tip: </span>
                                        <span className="text-sm opacity-70">
                                            Paste a direct image URL (jpg/png/webp). Preview updates instantly.
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <label className="form-control flex flex-col">
                                <div className="label mb-2">
                                    <span className="label-text font-medium">Description</span>
                                    <span className="label-text-alt opacity-70">Readable and concise</span>
                                </div>
                                <textarea
                                    className="textarea textarea-bordered min-h-[160px] w-full"
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Book description..."
                                    required
                                />
                            </label>
                        </div>
                    </div>

                    <div className="divider my-0"></div>

                    {/* Actions */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <p className="text-xs opacity-70">
                            New book will be created and saved to the database.
                        </p>

                        <div className="flex items-center gap-2">
                            <Link className="btn btn-ghost" href="/dashboard/admin/books">
                                Cancel
                            </Link>
                            <button className="btn btn-primary" disabled={saving}>
                                {saving ? <span className="loading loading-spinner loading-sm"></span> : null}
                                Create Book
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
