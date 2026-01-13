"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        <div className="max-w-md mx-auto p-6">
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="text-2xl font-bold">Login</h2>

                    {error ? (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    ) : null}

                    <form onSubmit={handleLogin} className="space-y-3">
                        <input
                            className="input input-bordered w-full"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            className="input input-bordered w-full"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button className="btn btn-primary w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <button
                        className="btn btn-outline w-full"
                        onClick={() => signIn("google")}
                    >
                        Continue with Google
                    </button>

                    <button
                        className="btn btn-outline w-full"
                        onClick={() => signIn("github")}
                    >
                        Continue with GitHub
                    </button>

                    <p className="text-sm mt-2">
                        New here? <a className="link" href="/register">Register</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
