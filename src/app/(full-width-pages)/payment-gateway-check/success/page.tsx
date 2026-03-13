'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PaymentGatewayCheckSuccessPage() {
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    const obj: Record<string, string> = {};
    search.forEach((v, k) => { obj[k] = v; });
    setParams(obj);
  }, []);

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Payment gateway check – return</h1>
      <p className="text-sm text-gray-600 mb-4">
        Genie redirected here after payment. Query params:
      </p>
      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto mb-6">
        {Object.keys(params).length ? JSON.stringify(params, null, 2) : 'None'}
      </pre>
      <Link href="/payment-gateway-check" className="text-blue-600 hover:underline">
        ← Back to payment gateway check
      </Link>
    </div>
  );
}
