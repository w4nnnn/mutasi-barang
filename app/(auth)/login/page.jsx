import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import { getCurrentUser } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Sistem Inventori Ipin Motor</p>
          <h1 className="text-2xl font-semibold">Keluar-Masuk Barang</h1>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          Gunakan akun admin atau pemilik untuk mengakses dashboard persediaan.
        </p>
      </div>
    </div>
  );
}
