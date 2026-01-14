import Link from "next/link";
import {Image} from "next/dist/client/image-component";

export default function ReviewRow({ index, review, busy, showApprove, onApprove, onDelete }) {
    const status = review?.status || "pending";
    const book = review?.book || {};
    const cover = book?.coverImage;

    return (
        <tr>
            <td>{index + 1}</td>
            {/* User */}
            <td>
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <Image width={40} height={40}
                                src={review?.userPhoto}
                                alt="user"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold">{review?.userName || "User"}</div>
                        <div className="text-xs opacity-70">{review?.userEmail}</div>
                    </div>
                </div>
            </td>

            {/* Book (Cover + Title + Author) */}
            <td>
                <Link href={`/books/${review.bookId}`} className="flex items-center gap-3 group">
                    {/* thumb */}
                    <div className="w-12 h-16 rounded-md overflow-hidden bg-base-200 border">
                        {cover ? (
                            <Image width={48} height={56}
                                src={cover}
                                alt={book?.title || "book"}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs opacity-60">
                                No cover
                            </div>
                        )}
                    </div>

                    {/* meta */}
                    <div className="min-w-0">
                        <div className="font-semibold link link-primary group-hover:underline truncate max-w-[260px]">
                            {book?.title || "Unknown book"}
                        </div>
                        <div className="text-xs opacity-70 truncate max-w-[260px]">
                            {book?.author || "Unknown author"}
                        </div>

                        {/* optional id small */}
                        <div className="text-[11px] opacity-50 mt-0.5 truncate max-w-[260px]">
                            {review.bookId}
                        </div>
                    </div>
                </Link>
            </td>

            {/* Rating */}
            <td>
                <div className="badge badge-outline">{review?.rating} / 5</div>
            </td>

            {/* Review */}
            <td className="max-w-[420px]">
                <div className="truncate" title={review?.text}>
                    {review?.text}
                </div>
            </td>

            {/* Status */}
            <td>
        <span
            className={`badge ${
                status === "approved" ? "badge-success" : "badge-warning"
            } badge-outline`}
        >
          {status}
        </span>
            </td>

            {/* Actions */}
            <td className="text-right">
                <div className="flex justify-end gap-2">
                    {showApprove ? (
                        <button
                            className="btn btn-success btn-sm"
                            onClick={onApprove}
                            disabled={busy}
                            type="button"
                        >
                            {busy ? <span className="loading loading-spinner loading-xs"></span> : null}
                            Approve
                        </button>
                    ) : null}

                    <button
                        className="btn btn-error btn-sm"
                        onClick={onDelete}
                        disabled={busy}
                        type="button"
                    >
                        {busy ? <span className="loading loading-spinner loading-xs"></span> : null}
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
}
