"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="bg-circles">
        <div className="circle-1" /><div className="circle-2" /><div className="circle-3" /><div className="circle-4" />
      </div>
      <form onSubmit={handleSubmit} className="glass w-full max-w-sm space-y-4 p-8">
        <h1 className="text-xl font-bold text-white">Admin Login</h1>
        <input
          type="email" placeholder="Email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none"
        />
        <input
          type="password" placeholder="Password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
