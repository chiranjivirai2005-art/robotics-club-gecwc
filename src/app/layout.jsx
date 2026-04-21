import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeedbackFab from "@/components/FeedbackFab";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Robotics Club | GEC West Champaran",
  description:
    "Official website of the Robotics Club at Government Engineering College, West Champaran.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-primary text-white font-inter antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <FeedbackFab />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
