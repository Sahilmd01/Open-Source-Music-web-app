import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/providers";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { themeInitScript } from "@/lib/theme";
import "@/styles/index.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${SITE_NAME} — Stream Music, Discover Playlists & Artists`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Listenify Team" }],
  keywords: [
    "Listenify",
    "music player",
    "online music streaming",
    "playlists",
    "albums",
    "artists",
    "high quality audio",
    "curated playlists",
    "listen to music",
  ],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Stream Music, Discover Playlists & Artists`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/shared banner.jpeg",
        width: 1200,
        height: 630,
        alt: "Listenify Music Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Stream Music, Discover Playlists & Artists`,
    description: SITE_DESCRIPTION,
    images: ["/shared banner.jpeg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "180x180" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
