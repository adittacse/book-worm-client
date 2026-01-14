"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const uploadToCloudinary = async (file) => {
        setUploading(true);
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !preset) {
                throw new Error("Cloudinary env missing (cloud name / upload preset)");
            }

            const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
            const form = new FormData();
            form.append("file", file);
            form.append("upload_preset", preset);

            const res = await fetch(url, { method: "POST", body: form });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error?.message || "Cloudinary upload failed");
            }

            if (!data?.secure_url) {
                throw new Error("No secure_url returned from Cloudinary");
            }

            return data.secure_url;
        } finally {
            setUploading(false);
        }
    };

    const handlePickPhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        // basic validation
        if (!name.trim()) {
            return setError("Name is required");
        }
        if (!email.trim()) {
            return setError("Email is required");
        }
        if (!password) {
            return setError("Password is required");
        }
        // if (password.length < 6) {
        //     return setError("Password must be at least 6 characters");
        // }
        const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!strong.test(password)) {
            return setError("Password must be 6+ chars with uppercase, lowercase and a number.");
        }
        if (!photoFile) {
            return setError("Photo is required");
        }

        setLoading(true);

        try {
            // 1) upload photo
            const photo = await uploadToCloudinary(photoFile);

            // 2) register in backend
            await api.post("/auth/register", {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                photo,
                password,
            });

            // 3) auto login using credentials
            const res = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
                callbackUrl: "/",
            });

            if (res?.error) {
                router.push("/login");
                return;
            }

            router.push("/");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Registration failed. Try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-base-200">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* left info */}
                <div className="hidden md:flex card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="text-2xl font-bold">Create your BookWorm account</h2>
                        <p className="text-sm opacity-70 mt-1">
                            Upload your photo, set a secure password, and start tracking your reading.
                        </p>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="badge badge-primary badge-outline mt-1">1</span>
                                <p className="text-sm opacity-80">Personal library shelves with progress.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="badge badge-primary badge-outline mt-1">2</span>
                                <p className="text-sm opacity-80">Reviews with admin moderation.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="badge badge-primary badge-outline mt-1">3</span>
                                <p className="text-sm opacity-80">Smart recommendations for you.</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="alert">
                                <span className="text-sm">Tip: Use a strong password (6+ chars).</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* register form */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="text-2xl font-bold">Register</h2>
                        <p className="text-sm opacity-70">Create a new account</p>

                        {error ? (
                            <div className="alert alert-error mt-4">
                                <span className="text-sm">{error}</span>
                            </div>
                        ) : null}

                        <form onSubmit={handleRegister} className="mt-4 space-y-3">
                            {/* photo */}
                            <div className="flex items-center gap-4">
                                <div className="avatar">
                                    <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                        <img
                                            src={photoPreview || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
                                            alt="preview"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="form-control w-full">
                                        <div className="label">
                                            <span className="label-text">Profile Photo</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="file-input file-input-bordered w-full"
                                            onChange={handlePickPhoto}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* name */}
                            <label className="form-control w-full">
                                <div className="label">
                                    <span className="label-text">Full Name</span>
                                </div>
                                <input
                                    className="input input-bordered w-full mb-2"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </label>

                            {/* email */}
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

                            {/* password */}
                            <label className="form-control w-full">
                                <div className="label">
                                    <span className="label-text">Password</span>
                                </div>
                                <input
                                    className="input input-bordered w-full mb-4"
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </label>

                            <button className="btn btn-primary w-full" disabled={loading || uploading}>
                                {(loading || uploading) ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : null}
                                {uploading ? "Uploading photo..." : loading ? "Creating account..." : "Create Account"}
                            </button>
                        </form>

                        <p className="text-sm mt-4 opacity-80">
                            Already have an account?{" "}
                            <Link className="link link-primary font-medium" href="/login">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
