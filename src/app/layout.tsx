export const metadata = {
  title: "EORI Validator Pro",
  description: "Validate EU & GB EORI numbers with trader details.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
