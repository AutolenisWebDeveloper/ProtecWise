import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ProtecWise — Life & Health Insurance',
    template: '%s | ProtecWise',
  },
  description:
    'Protecting What Matters Most. Compare life insurance, run a needs analysis, and connect with a licensed agent.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
