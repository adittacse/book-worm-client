"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/apiRoutes";

export default function ReviewsBox({ bookId, onReviewSubmitted }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [msg, setMsg] = useState("");

    const loadReviews = async () => {
        setLoading(true);
        try {
            const r = await api.get(API_ROUTES.REVIEWS_BY_BOOK(bookId));
            setReviews(r.data || []);
        } catch {
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [bookId]);

    const submitReview = async (e) => {
        e.preventDefault();
        setMsg("");

        if (!text.trim()) {
            setMsg("Review is required");
            return;
        }

        const rt = Number(rating);
        if (Number.isNaN(rt) || rt < 1 || rt > 5) {
            setMsg("Rating must be between 1-5");
            return;
        }

        try {
            await api.post(API_ROUTES.REVIEW_CREATE, {
                bookId,
                rating: rt,
                text: text.trim(),
            });

            setText("");
            setRating(5);
            setMsg("Review submitted! Waiting for admin approval.");
            onReviewSubmitted?.();
        } catch (e2) {
            setMsg(e2?.response?.data?.message || "Failed to submit review");
        }
    };

    return (
        <div className="mt-2">
            <h3 className="text-lg font-bold">Reviews</h3>

            {/* form */}
            <div className="card bg-base-100 shadow mt-4">
                <div className="card-body">
                    <h4 className="font-semibold">Write a review</h4>

                    {msg ? (
                        <div className="alert mt-3">
                            <span className="text-sm">{msg}</span>
                        </div>
                    ) : null}

                    <form onSubmit={submitReview} className="mt-3 space-y-3">
                        <div className="flex items-center gap-3">
                            <label className="text-sm opacity-70">Rating</label>
                            <select
                                className="select select-bordered select-sm"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                            >
                                <option value={5}>5 ⭐</option>
                                <option value={4}>4 ⭐</option>
                                <option value={3}>3 ⭐</option>
                                <option value={2}>2 ⭐</option>
                                <option value={1}>1 ⭐</option>
                            </select>
                        </div>

                        <textarea
                            className="textarea textarea-bordered w-full"
                            rows={4}
                            placeholder="Write your honest review..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <button className="btn btn-primary btn-sm w-full md:w-fit">
                            Submit Review
                        </button>
                    </form>
                </div>
            </div>

            {/* list */}
            <div className="mt-4">
                {loading ? (
                    <div className="py-10 flex justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-sm opacity-70 py-6">No approved reviews yet.</p>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((r) => (
                            <div key={r._id} className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">{r.userName || "User"}</p>
                                            <p className="text-xs opacity-70">{r.userEmail}</p>
                                        </div>
                                        <div className="badge badge-primary badge-outline">
                                            {r.rating} / 5
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm opacity-90">{r.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button className="btn btn-ghost btn-sm mt-3" onClick={loadReviews}>
                    Refresh Reviews
                </button>
            </div>
        </div>
    );
}
