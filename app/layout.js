import "./globals.css";

export const metadata = {
  title: "SQL Server Production DBA Academy",
  description: "A practical, self-paced learning path for SQL Server database administration."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
