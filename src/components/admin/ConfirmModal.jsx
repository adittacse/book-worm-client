"use client";

export default function ConfirmModal({
     open,
     title = "Confirm",
     description = "Are you sure?",
     confirmText = "Yes",
     cancelText = "Cancel",
     loading = false,
     onConfirm,
     onClose,
 }) {
    if (!open) {
        return null;
    }

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="py-3 text-sm opacity-80">{description}</p>

                <div className="modal-action">
                    <button className="btn" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </button>

                    <button className="btn btn-error" onClick={onConfirm} disabled={loading}>
                        {
                            loading ? <span className="loading loading-spinner loading-xs"></span> : null
                        }
                        {confirmText}
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={loading ? undefined : onClose}></div>
        </div>
    );
}
