'use client'

import dynamic from 'next/dynamic'

const BillingContent = dynamic(() => import('./billing-content'), {
  ssr: false,
})

export default function BillingPage() {
  return <BillingContent />
}
