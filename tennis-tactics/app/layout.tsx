import Link from "next/link";
import "./globals.css";
import { TopNav } from "./ui/nav";

export const metadata = {
  title: "TennisTactics",
  description: "Modern tennis stats and insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">
        <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-6">
            <Link href="/" className="text-lg font-semibold text-white">
              TennisTactics
            </Link>

            <TopNav />
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
