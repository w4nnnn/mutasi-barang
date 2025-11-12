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
        <LoginForm />
      </div>
    </div>
  );
}
