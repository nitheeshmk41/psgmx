import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PSGMX-Leetboard",
  description: "Track coding progress and compete with peers",
  viewport: "width=device-width, initial-scale=1.0",
  openGraph: {
    title: "PSGMX-Leetboard",
    description: "Track coding progress and compete with peers",
    url: "https://psgmx.vercel.app/",
    siteName: "PSGMX-Leetboard",
    images: [
      {
        url: "https://psgmx.vercel.app/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PSGMX-Leetboard Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PSGMX-Leetboard",
    description: "Track coding progress and compete with peers",
    images: ["https://psgmx.vercel.app/opengraph-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground transition-colors duration-300 min-h-screen font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
            <footer className="glass py-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} For Mx-ians By G2 Mx-ians. All rights reserved.
            </footer>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "glass text-foreground border border-border/50",
              style: {
                background: "var(--card)",
                color: "var(--card-foreground)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
