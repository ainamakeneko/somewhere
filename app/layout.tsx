import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Somewhere',
  description: 'A small journey with nothing to accomplish.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
