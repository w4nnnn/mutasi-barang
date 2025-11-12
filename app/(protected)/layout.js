import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}
