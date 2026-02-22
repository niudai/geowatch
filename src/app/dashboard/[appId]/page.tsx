'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client component to prevent prerendering
// ssr: false prevents this component from being rendered on the server during build
const AppDetailContent = dynamic(() => import('./app-detail-content'), {
  ssr: false,
});

export default function AppDetail({ params }: { params: Promise<{ appId: string }> }) {
  return <AppDetailContent params={params} />;
}
