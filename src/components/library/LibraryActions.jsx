"use client";

import { useMemo, useState } from "react";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/apiRoutes";

export default function LibraryActions({ book, libraryItem, onChanged }) {
    // libraryItem = current user library doc for this book (or null)
    const [savingShelf, setSavingShelf] = useState(false);
    const [savingProgress, setSavingProgress] = useState(false);
    const [draftPages, setDraftPages] = useState(libraryItem?.pagesRead ?? 0);
    const [msg, setMsg] = useState("");

    const totalPages = useMemo(() => Number(book?.totalPages || 0), [book]);

    const moveShelf = async (shelf) => {
        setMsg("");
        setSavingShelf(true);
        try {
            await api.post(API_ROUTES.LIBRARY_ADD, { bookId: book._id, shelf });
            onChanged?.();
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to update shelf");
        } finally {
            setSavingShelf(false);
        }
    };

    const saveProgress = async () => {
        setMsg("");

        if (!libraryItem?._id) {
            setMsg("Add this book to 'Currently Reading' first.");
            return;
        }

        const p = Number(draftPages);
        if (Number.isNaN(p) || p < 0) {
            setMsg("Invalid pages");
            return;
        }

        // optional: prevent over total pages
        if (totalPages > 0 && p > totalPages) {
            setMsg(`Pages cannot be more than ${totalPages}`);
            return;
        }

        setSavingProgress(true);
        try {
            await api.patch(API_ROUTES.LIBRARY_PROGRESS_BY_ID(libraryItem._id), {
                pagesRead: p,
                progressType: "pages",
            });
            onChanged?.();
        } catch (e) {
            setMsg(e?.response?.data?.message || "Failed to update progress");
        } finally {
            setSavingProgress(false);
        }
    };

    return (
        <div className="mt-4">
            {msg ? (
                <div className="alert alert-error mb-3">
                    <span className="text-sm">{msg}</span>
                </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
                <button
                    className="btn btn-sm btn-outline"
                    onClick={() => moveShelf("want")}
                    disabled={savingShelf}
                >
                    Want
                </button>
                <button
                    className="btn btn-sm btn-outline"
                    onClick={() => moveShelf("reading")}
                    disabled={savingShelf}
                >
                    Reading
                </button>
                <button
                    className="btn btn-sm btn-outline"
                    onClick={() => moveShelf("read")}
                    disabled={savingShelf}
                >
                    Read
                </button>
            </div>

            {/* progress only when reading */}
            {libraryItem?.shelf === "reading" ? (
                <div className="mt-4">
                    <p className="text-sm opacity-80">
                        Progress: {libraryItem?.pagesRead || 0}/{totalPages || 0} pages ({libraryItem?.percent || 0}%)
                    </p>

                    <div className="flex gap-2 mt-2">
                        <input
                            className="input input-bordered input-sm w-full"
                            type="number"
                            min="0"
                            max={totalPages > 0 ? totalPages : undefined}
                            value={draftPages}
                            onChange={(e) => setDraftPages(e.target.value)}
                        />
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={saveProgress}
                            disabled={savingProgress}
                            type="button"
                        >
                            {savingProgress ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : null}
                            Save
                        </button>
                    </div>

                    <progress
                        className="progress progress-primary mt-3"
                        value={libraryItem?.percent || 0}
                        max="100"
                    ></progress>
                </div>
            ) : (
                <div className="mt-3 text-sm opacity-70">
                    To track progress, move this book to <b>Currently Reading</b>.
                </div>
            )}
        </div>
    );
}
