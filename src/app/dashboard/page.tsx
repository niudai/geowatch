import dynamic from 'next/dynamic';

// Dynamically import the client component to prevent prerendering
// ssr: false prevents this component from being rendered on the server during build
const DashboardContent = dynamic(() => import('./dashboard-content'), {
  ssr: false,
});

export default function Dashboard() {
  return <DashboardContent />;
}
