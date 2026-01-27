import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EdiGuessr - Edinburgh GeoGuessr Game',
  description: 'Explore Edinburgh through street views and test your geography knowledge in this multiplayer game',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
