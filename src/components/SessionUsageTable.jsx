"use client";

const formatDate = (value) => {
  if (!value) return "Not available";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  return "Not available";
};

export default function SessionUsageTable({ records }) {
  if (records.length === 0) {
    return <div className="content-card text-center text-slate-300">No inventory usage linked to this session.</div>;
  }

  return (
    <div className="content-card overflow-hidden p-0">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="eyebrow">Session Usage</p>
        <h2 className="mt-2 text-2xl text-white">Items used in this session</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Item</th>
              <th className="px-5 py-4">Quantity</th>
              <th className="px-5 py-4">Taken By</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Issued At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {records.map((record) => (
              <tr key={record.id} className="bg-slate-950/20">
                <td className="px-5 py-4 font-semibold text-white">{record.itemName}</td>
                <td className="px-5 py-4">{record.quantity}</td>
                <td className="px-5 py-4">{record.takenBy}</td>
                <td className="px-5 py-4">{record.location}</td>
                <td className="px-5 py-4">{formatDate(record.issuedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
