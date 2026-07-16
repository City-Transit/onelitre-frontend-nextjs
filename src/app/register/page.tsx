import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <RegisterForm />
      </Suspense>
    </>
  );
}
