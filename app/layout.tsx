import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollingHeadline from "@/components/ScrollingHeadline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deepthi Matrimony",
  description: "Deepthi Matrimony - Find your life partner",
  icons: { icon: "/svgviewer-output.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/svgviewer-output.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-200`}
      >
        <div id="theme-wrapper" className="min-h-screen transition-colors duration-200 flex flex-col" style={{ background: 'linear-gradient(135deg, #FFF1F4 0%, #FFF5F7 40%, #FFFFFF 100%)' }}>
          <ScrollingHeadline />
          <Navbar />
          <main id="theme-main" className="flex flex-col items-center w-full transition-colors duration-200" style={{ backgroundColor: '#FFF1F4', paddingTop: '85px' }}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
