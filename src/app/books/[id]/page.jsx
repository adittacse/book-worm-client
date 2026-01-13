"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";

import LibraryActions from "@/components/library/LibraryActions";
import ReviewsBox from "@/components/reviews/ReviewsBox";

export default function BookDetailsPage() {
    const {id} = useParams();

    const [book, setBook] = useState(null);
    const [libraryItems, setLibraryItems] = useState([]); // ✅ to find current book's library info
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const load = async () => {
        setLoading(true);
        setErr("");

        try {
            // 1) book load
            const res = await api.get(`/books/${id}`);
            setBook(res.data);

            // 2) my library load (needed for current shelf/progress)
            const lib = await api.get(`/library/me`);
            setLibraryItems(lib.data || []);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load book");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            load();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // this book's library item (if exists)
    const myItem = useMemo(() => {
        if (!book?._id) return null;
        return libraryItems.find((x) => x.bookId === book._id) || null;
    }, [libraryItems, book]);

    if (loading) {
        return (<div className="min-h-[50vh] flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
        </div>);
    }

    if (err) {
        return (<div className="max-w-4xl mx-auto px-4 py-6">
            <div className="alert alert-error">
                <span>{err}</span>
            </div>
        </div>);
    }

    if (!book) {
        return null;
    }

    return (<div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT CARD */}
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
                        <span className="badge badge-outline">
                            ⭐ {Number(book?.avgRating || 0).toFixed(1)}
                        </span>
                        <span className="text-sm opacity-70">
                            Shelved: {book?.totalShelved || 0}
                        </span>
                    </div>

                    {/* Library actions (shelf + progress) */}
                    <LibraryActions book={book} libraryItem={myItem} onChanged={load}/>
                </div>
            </div>

            {/* RIGHT SIDE */}
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

                {/* Reviews Box (list + submit) */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <ReviewsBox bookId={book._id} onReviewSubmitted={load}/>
                    </div>
                </div>
            </div>
        </div>
    </div>);
}
