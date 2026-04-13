"use client";

import { useEffect, useState } from "react";
import { doc, getDocs, query, updateDoc, where, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(
        query(collection(db, "users"), where("status", "==", "pending"))
      );
      setUsers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    };

    fetchUsers();
  }, []);

  const updateUser = async (id, payload) => {
    await updateDoc(doc(db, "users", id), {
      ...payload,
      reviewedAt: serverTimestamp(),
    });
    setUsers((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <p className="eyebrow">Admin Users</p>
          <h1 className="section-title">Approve registration roles</h1>
        </section>

        <div className="space-y-5">
          {users.length === 0 ? (
            <div className="content-card text-slate-300">No pending user approvals.</div>
          ) : (
            users.map((item) => (
              <div key={item.id} className="content-card">
                <h2 className="text-2xl text-white">{item.name || item.email}</h2>
                <div className="mt-3 space-y-1 text-sm text-slate-300">
                  <p>Email: {item.email}</p>
                  <p>Requested Role: {item.requestedRole}</p>
                  <p>Status: {item.status}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() =>
                      updateUser(item.id, {
                        approvedRole: item.requestedRole,
                        status: "approved",
                      })
                    }
                    className="btn-admin"
                  >
                    Approve Role
                  </button>
                  <button
                    onClick={() =>
                      updateUser(item.id, {
                        approvedRole: "rejected",
                        status: "rejected",
                      })
                    }
                    className="rounded-full border border-red-400/20 bg-red-400/10 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-red-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
