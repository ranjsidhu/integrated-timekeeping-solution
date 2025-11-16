import "./styles/carbon.scss";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Providers from "./providers/Providers";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Integrated Timekeeping Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plexSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
