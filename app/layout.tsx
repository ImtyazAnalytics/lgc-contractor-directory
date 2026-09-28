import "./globals.css";
import "./auth.css";
export const metadata = {
  title: "LGC Contractor & Vendor Directory",
  description:
    "Search and manage LGC Global contractors, vendors, and contacts",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
