"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginClient() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        setLoading(false);

        if (res?.error) {
            setError("Invalid email or password");
            return;
        }

        router.push(callbackUrl);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-base-200">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Cozy Brand Panel */}
                <div className="hidden md:flex card bg-base-100 shadow-xl overflow-hidden">
                    <div className="card-body">
                        <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-12">
                                    <span className="text-xl">BW</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">BookWorm</h1>
                                <p className="text-sm opacity-70">Your cozy reading companion</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="badge badge-primary badge-outline mt-1">1</span>
                                <p className="text-sm opacity-80">
                                    Track shelves: <span className="font-semibold">Want</span>,{" "}
                                    <span className="font-semibold">Reading</span>,{" "}
                                    <span className="font-semibold">Read</span>
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="badge badge-primary badge-outline mt-1">2</span>
                                <p className="text-sm opacity-80">Add progress and reviews with moderation</p>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="badge badge-primary badge-outline mt-1">3</span>
                                <p className="text-sm opacity-80">Get personalized recommendations</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="alert">
                <span className="text-sm">
                  Tip: Use a strong password and keep your account safe.
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Login Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Welcome back</h2>
                                <p className="text-sm opacity-70">Login to continue your reading journey</p>
                            </div>
                            <div className="md:hidden avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-10">
                                    <span className="text-lg">BW</span>
                                </div>
                            </div>
                        </div>

                        {error ? (
                            <div className="alert alert-error mt-4">
                                <span className="text-sm">{error}</span>
                            </div>
                        ) : null}

                        <form onSubmit={handleLogin} className="mt-4 space-y-3">
                            <label className="form-control w-full">
                                <div className="label">
                                    <span className="label-text">Email</span>
                                </div>
                                <input
                                    className="input input-bordered w-full mb-2"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="form-control w-full">
                                <div className="label flex items-center justify-between">
                                    <span className="label-text">Password</span>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => setShowPass((p) => !p)}
                                    >
                                        {showPass ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <input
                                    className="input input-bordered w-full mb-4"
                                    type={showPass ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </label>

                            <button className="btn btn-primary w-full" disabled={loading}>
                                {loading ? <span className="loading loading-spinner loading-sm"></span> : null}
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>

                        <p className="text-sm mt-4 opacity-80">
                            New here?{" "}
                            <Link className="link link-primary font-medium" href="/register">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
