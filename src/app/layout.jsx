import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
    title: "BookWorm",
    description: "Personalized Book Recommendation & Reading Tracker",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
            <SessionProvider>
                <div className="min-h-screen flex flex-col">
                    {/*<Navbar />*/}
                    <main className="flex-1">
                        {children}
                    </main>
                    {/*<Footer />*/}
                </div>
            </SessionProvider>
            </body>
        </html>
    );
}
