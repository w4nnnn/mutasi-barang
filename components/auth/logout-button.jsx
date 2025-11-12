'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function LogoutButton({ className, children }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error ?? 'Gagal logout');
        }

        toast.success('Berhasil logout.');
        router.replace('/login');
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error.message ?? 'Gagal logout');
      }
    });
  };

  return (
    <Button type="button" variant="outline" className={className} onClick={handleLogout} disabled={isPending}>
      {isPending ? 'Keluar...' : children ?? 'Keluar'}
    </Button>
  );
}
