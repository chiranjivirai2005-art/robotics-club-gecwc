"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-shell">
      <form onSubmit={handleLogin} className="auth-card">
        <p className="eyebrow">Member Access</p>
        <h1 className="mt-3 text-4xl text-white">Log in to your dashboard</h1>
        <p className="mt-4 leading-7 text-slate-300">
          Access event workflows, submissions, and role-specific club tools.
        </p>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-4">
          <input name="email" type="email" placeholder="Email" required className="field" />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="field"
          />
        </div>

        <button className="btn-primary mt-8 w-full">
          Continue
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
