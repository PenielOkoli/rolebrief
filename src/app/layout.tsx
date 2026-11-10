import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans';
import './globals.css';
export const metadata: Metadata = { title: 'RoleBrief — Make your next move count', description: 'Turn a job description into clear requirements, an honest evidence checklist, and a practical preparation plan.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
