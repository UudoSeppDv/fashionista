// src/app/aitah/page.tsx
import React, { Suspense } from 'react';
import AitahPageClient from '@/components/checkout/AitahPageClient';

export default function AitahPage() {
  return (
    <Suspense fallback={<div>Laen...</div>}>
      <AitahPageClient />
    </Suspense>
  );
}
