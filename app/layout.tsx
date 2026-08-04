
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://nightmare-camp.com"),

  title: "NIGHTmare CAMP",
  description: "Professional football team management platform",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  openGraph: {
    title: "NIGHTmare CAMP",
    description: "Professional football team management platform",
    url: "/",
    siteName: "NIGHTmare CAMP",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "NIGHTmare CAMP",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "NIGHTmare CAMP",
    description: "Professional football team management platform",
    images: ["/opengraph-image.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}