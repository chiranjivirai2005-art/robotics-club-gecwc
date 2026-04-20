"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import DeleteItemButton from "@/components/DeleteItemButton";
import { db } from "@/lib/firebase";

export default function AdminTeamPage() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const snapshot = await getDocs(collection(db, "teamMembers"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(data);
    };

    fetchMembers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Team Members</h1>
      <Link
        href="/admin/team/create"
        className="inline-block mb-6 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Add Team Member
      </Link>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="rounded border p-4 shadow">
            <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full">
              <Image
                src={member.imageURL || "/images/club-logo.png"}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="mt-2 text-center font-semibold">{member.name}</h3>
            <p className="text-center text-gray-500">{member.position}</p>

            <div className="mt-3 flex justify-center">
              <DeleteItemButton
                itemId={member.id}
                collectionName="teamMembers"
                publicId={member.public_id}
                label="Delete Member"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
