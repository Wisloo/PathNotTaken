import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "PathNotTaken — Discover Career Paths You Never Knew Existed",
  description:
    "AI-powered career exploration that reveals non-obvious career paths based on your unique skills and interests. Go beyond the obvious.",
  keywords: ["career discovery", "career paths", "skills assessment", "career change", "AI career recommendations"],
  openGraph: {
    title: "PathNotTaken — Discover Career Paths You Never Knew Existed",
    description: "AI-powered career exploration that reveals non-obvious career paths based on your unique skills and interests.",
    type: "website",
    siteName: "PathNotTaken",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathNotTaken — Discover Career Paths You Never Knew Existed",
    description: "AI-powered career exploration that reveals non-obvious career paths based on your unique skills and interests.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#059669" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 font-sans antialiased">
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
