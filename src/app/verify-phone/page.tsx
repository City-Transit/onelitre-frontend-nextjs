import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { VerifyPhoneForm } from './verify-phone-form';

export default function VerifyPhonePage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <VerifyPhoneForm />
      </Suspense>
    </>
  );
}
