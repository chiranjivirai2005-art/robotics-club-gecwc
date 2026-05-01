export const metadata = {
  title: "Admin | Robotics Club",
  description: "Administrative tools for the Robotics Club website.",
};

export default function AdminLayout({ children }) {
  return <section className="min-h-screen bg-slate-950">{children}</section>;
}
