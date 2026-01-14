"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Image from "next/image";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    const [search, setSearch] = useState("");

    // role update modal state
    const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
    const [roleTarget, setRoleTarget] = useState(null);

    // delete modal state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [targetUser, setTargetUser] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [updatingRoleId, setUpdatingRoleId] = useState("");

    const load = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await api.get("/users");
            setUsers(res.data || []);
        } catch (e) {
            setUsers([]);
            setMsg(e?.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => {
            const name = (u?.name || "").toLowerCase();
            const email = (u?.email || "").toLowerCase();
            const role = (u?.role || "").toLowerCase();
            return name.includes(q) || email.includes(q) || role.includes(q);
        });
    }, [users, search]);

    const counts = useMemo(() => {
        const admin = users.filter((u) => u?.role === "admin").length;
        const normal = users.filter((u) => u?.role === "user").length;
        return { total: users.length, admin, normal };
    }, [users]);

    const changeRole = async (userId, nextRole) => {
        setMsg("");

        // optimistic update
        const prev = users;
        setUpdatingRoleId(userId);
        setUsers((cur) =>
            cur.map((u) => (u._id === userId ? { ...u, role: nextRole } : u))
        );

        try {
            await api.patch(`/users/${userId}/role`, {
                role: nextRole
            });
        } catch (e) {
            setUsers(prev);
            setMsg(e?.response?.data?.message || "Failed to update role");
        } finally {
            setUpdatingRoleId("");
        }
    };

    const openRoleConfirm = (u, nextRole) => {
        setMsg("");
        setRoleTarget({
            userId: u._id,
            prevRole: u?.role,
            nextRole,
            name: u?.name,
            email: u?.email,
        });
        setRoleConfirmOpen(true);
    };

    const closeRoleConfirm = () => {
        if (updatingRoleId) {
            return;
        }
        setRoleConfirmOpen(false);
        setRoleTarget(null);
    };

    const confirmRoleChange = async () => {
        if (!roleTarget?.userId || !roleTarget?.nextRole) {
            return;
        }

        await changeRole(roleTarget.userId, roleTarget.nextRole);
        setRoleConfirmOpen(false);
        setRoleTarget(null);
    };

    const openDelete = (u) => {
        setMsg("");
        setTargetUser(u);
        setDeleteOpen(true);
    };

    const closeDelete = () => {
        if (deleting) return;
        setDeleteOpen(false);
        setTargetUser(null);
    };

    const confirmDelete = async () => {
        if (!targetUser?._id) return;

        setMsg("");
        setDeleting(true);

        const prev = users;
        setUsers((cur) => cur.filter((u) => u._id !== targetUser._id));

        try {
            await api.delete(`/users/${targetUser._id}`);
            setDeleteOpen(false);
            setTargetUser(null);
        } catch (e) {
            setUsers(prev); // revert
            setMsg(e?.response?.data?.message || "Failed to delete user");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-base-content">Manage Users</h1>
                    <p className="text-sm opacity-70 mt-1">
                        View users, change roles, and delete accounts.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="join">
                        <span className="btn btn-sm btn-outline join-item">Total: {counts.total}</span>
                        <span className="btn btn-sm btn-outline join-item">Admin: {counts.admin}</span>
                        <span className="btn btn-sm btn-outline join-item">User: {counts.normal}</span>
                    </div>

                    <button className="btn btn-outline" onClick={load}>
                        Refresh
                    </button>
                </div>
            </div>

            {msg ? (
                <div className="alert">
                    <span className="text-sm">{msg}</span>
                </div>
            ) : null}

            {/* search */}
            <div className="card bg-base-100 border">
                <div className="card-body p-4 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <input
                            className="input input-bordered w-full md:max-w-md"
                            placeholder="Search by name / email / role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="text-sm opacity-70">
                            Showing <span className="font-semibold">{filtered.length}</span> of{" "}
                            <span className="font-semibold">{users.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* table */}
            <div className="card bg-base-100 border">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                            <tr>
                                <th className="w-16">Sl.</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Current Role</th>
                                <th className="w-40">Change Role</th>
                                <th className="w-44 text-right">Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="py-10 text-center opacity-70">
                                            No users found.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((u, idx) => (
                                    <tr key={u._id}>
                                        <td>{idx + 1}</td>

                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="w-10 rounded-full bg-base-200">
                                                        {
                                                            <Image width={40} height={40} src={u?.photo} alt={u?.name || "user"} />
                                                        }
                                                    </div>
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="font-semibold truncate">
                                                        {u?.name || "Unnamed"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{u?.email}</td>

                                        <td className="capitalize">{u?.role}</td>

                                        <td>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="select select-bordered select-sm w-full"
                                                    value={u?.role || "user"}
                                                    onChange={(e) => {
                                                        const nextRole = e.target.value;
                                                        if (nextRole === (u?.role || "user")) return;
                                                        openRoleConfirm(u, nextRole);
                                                    }}
                                                    disabled={updatingRoleId === u._id}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>

                                                {updatingRoleId === u._id ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : null}
                                            </div>
                                        </td>

                                        <td className="text-right">
                                            <button
                                                className="btn btn-error btn-sm"
                                                onClick={() => openDelete(u)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {roleConfirmOpen ? (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirm role change</h3>

                        <p className="py-3 text-sm opacity-80">
                            You are about to change role for{" "}
                            <span className="font-semibold">{roleTarget?.name}</span>{" "}
                            <span className="opacity-70">({roleTarget?.email})</span>
                            <br />
                            <span className="font-mono text-xs">
                    {roleTarget?.prevRole} → {roleTarget?.nextRole}
                </span>
                        </p>

                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={closeRoleConfirm}
                                disabled={!!updatingRoleId}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={confirmRoleChange}
                                disabled={!!updatingRoleId}
                            >
                                {updatingRoleId ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : null}
                                Confirm
                            </button>
                        </div>
                    </div>

                    <div className="modal-backdrop" onClick={closeRoleConfirm}></div>
                </div>
            ) : null}

            {/* delete confirm modal */}
            {deleteOpen ? (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete user?</h3>
                        <p className="py-3 text-sm opacity-80">
                            This will permanently delete{" "}
                            <span className="font-semibold">{targetUser?.name || "this user"}</span>{" "}
                            ({targetUser?.email || ""}). This action cannot be undone.
                        </p>

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={closeDelete} disabled={deleting}>
                                Cancel
                            </button>
                            <button className="btn btn-error" onClick={confirmDelete} disabled={deleting}>
                                {deleting ? <span className="loading loading-spinner loading-sm"></span> : null}
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={closeDelete}></div>
                </div>
            ) : null}
        </div>
    );
}
