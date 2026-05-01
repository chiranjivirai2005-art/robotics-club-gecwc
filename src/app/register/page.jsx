"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        requestedRole: role,
        approvedRole: "pending",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-shell">
      <form onSubmit={handleRegister} className="auth-card">
        <p className="eyebrow">Join The Club</p>
        <h1 className="mt-3 text-4xl text-white">Create your robotics account</h1>
        <p className="mt-4 leading-7 text-slate-300">
          Register to submit activities and access member-specific workflows after approval.
        </p>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-4">
          <input name="name" type="text" placeholder="Full Name" required className="field" />
          <input name="email" type="email" placeholder="Email" required className="field" />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={6}
            className="field"
          />
          <select name="role" required className="field">
            <option value="volunteer">Volunteer</option>
            <option value="member">Member</option>
            <option value="coordinator">Coordinator</option>
            <option value="faculty">Faculty Coordinator</option>
          </select>
        </div>

        <button className="btn-primary mt-8 w-full">
          Register
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
