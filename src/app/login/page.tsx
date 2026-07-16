import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
