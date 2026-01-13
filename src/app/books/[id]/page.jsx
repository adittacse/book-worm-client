"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";

const shelves = [
    { value: "want", label: "Want to Read" },
    { value: "reading", label: "Currently Reading" },
    { value: "read", label: "Read" },
];

export default function BookDetailsPage() {
    const { id } = useParams();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [shelf, setShelf] = useState("want");
    const [saving, setSaving] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(5);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewMsg, setReviewMsg] = useState("");

    const load = async () => {
        setLoading(true);
        setErr("");

        // 1) book load
        try {
            const res = await api.get(`/books/${id}`);
            setBook(res.data);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load book");
            setLoading(false);
            return;
        }

        // 2) reviews load
        try {
            const r = await api.get(`/reviews?bookId=${id}`);
            setReviews(r.data || []);
        } catch (e) {
            setReviews([]);
            console.log("Reviews load failed:", e?.response?.status);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const addToShelf = async () => {
        setSaving(true);
        setReviewMsg("");
        try {
            await api.post("/library", { bookId: id, shelf });
            setReviewMsg("Added to your library successfully.");
        } catch (e) {
            setReviewMsg(e?.response?.data?.message || "Failed to add to library");
        } finally {
            setSaving(false);
        }
    };

    const submitReview = async () => {
        setReviewLoading(true);
        setReviewMsg("");
        try {
            if (!reviewText.trim()) {
                setReviewMsg("Review text is required.");
                return;
            }

            await api.post("/reviews", {
                bookId: id,
                rating: Number(rating),
                text: reviewText.trim(),
            });

            setReviewText("");
            setRating(5);
            setReviewMsg("Review submitted. It will be visible after admin approval.");
        } catch (e) {
            setReviewMsg(e?.response?.data?.message || "Failed to submit review");
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (err) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="alert alert-error">
                    <span>{err}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-base-100 shadow">
                    <figure className="p-4">
                        <img
                            src={book?.coverImage}
                            alt={book?.title}
                            className="rounded-xl w-full h-80 object-cover"
                        />
                    </figure>
                    <div className="card-body pt-0">
                        <h1 className="text-2xl font-bold">{book?.title}</h1>
                        <p className="opacity-70">{book?.author}</p>

                        <div className="mt-2 flex items-center justify-between">
                            <span className="badge badge-outline">⭐ {Number(book?.avgRating || 0).toFixed(1)}</span>
                            <span className="text-sm opacity-70">Shelved: {book?.totalShelved || 0}</span>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <select
                                className="select select-bordered w-full"
                                value={shelf}
                                onChange={(e) => setShelf(e.target.value)}
                            >
                                {
                                    shelves.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))
                                }
                            </select>

                            <button className="btn btn-primary" onClick={addToShelf} disabled={saving}>
                                {
                                    saving ? <span className="loading loading-spinner loading-xs"></span> : null
                                }
                                Add
                            </button>
                        </div>

                        {
                            reviewMsg ? (
                                <div className="alert mt-4">
                                    <span className="text-sm">{reviewMsg}</span>
                                </div>
                            ) : null
                        }
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="text-xl font-bold">Description</h2>
                            <p className="opacity-80 whitespace-pre-line">{book?.description}</p>
                            <p className="text-sm opacity-70 mt-2">
                                Total pages: {book?.totalPages || 0}
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="text-xl font-bold">Reviews</h2>

                            {
                                reviews.length === 0 ? (
                                    <p className="opacity-70">No approved reviews yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {
                                            reviews.map((r) => (
                                                <div key={r._id} className="p-3 rounded-lg border">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold">{r?.userName || "User"}</p>
                                                        <span className="badge badge-outline">⭐ {r?.rating}</span>
                                                    </div>
                                                    <p className="mt-2 opacity-80 whitespace-pre-line">{r?.text}</p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            }

                            <div className="divider">Write a review</div>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text">Rating (1-5)</span>
                                </div>
                                <select
                                    className="select select-bordered"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    {[5, 4, 3, 2, 1].map((x) => (
                                        <option key={x} value={x}>{x}</option>
                                    ))}
                                </select>
                            </label>

                            <textarea
                                className="textarea textarea-bordered mt-3"
                                rows={4}
                                placeholder="Write your thoughts..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            />

                            <button className="btn btn-primary mt-3" onClick={submitReview} disabled={reviewLoading}>
                                {
                                    reviewLoading ? <span className="loading loading-spinner loading-xs"></span> : null
                                }
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
