import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'Keluar-Masuk Barang',
  description: 'Sistem pencatatan stok, mutasi, dan nilai persediaan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-muted/20 text-foreground antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
