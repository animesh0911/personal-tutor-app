import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});
export const metadata: Metadata = {
  title: 'Curious Workshop · Quadratic Equations',
  description:
    'Learn quadratic equations one discovery at a time. Short lessons, helpful practice, and a path that adapts to you.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jakarta.variable}>{children}</body>
    </html>
  );
}
