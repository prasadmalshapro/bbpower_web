'use client';

import { useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/** Sample payload for Genie create transaction (working pattern). */
function getSamplePayload(returnUrl: string, webhookUrl: string) {
  return {
    currency: 'LKR',
    amount: 40000,
    localId: 'ORD-12345',
    redirectUrl: returnUrl,
    webhook: webhookUrl,
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      billingEmail: 'john.doe@example.com',
      billingAddress1: '123 Main Street',
      billingAddress2: 'Apt 4B',
      billingCity: 'Colombo',
      billingCountry: 'Sri Lanka',
      billingPostCode: '00100',
    },
    tokenizationDetails: {
      tokenize: true,
      paymentType: 'UNSCHEDULED',
    },
    paymentPortalExperience: {
      skipCustomerForm: false,
      skipProviderSelection: false,
    },
    apiVersion: '2.0',
    appVersion: 'geniebiz-connect-php',
    signMethod: 'sha1',
  };
}

export default function PaymentGatewayCheckPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [responseData, setResponseData] = useState<unknown>(null);

  const handleCheck = async () => {
    setStatus('loading');
    setMessage('');
    setResponseData(null);

    const returnUrl = 'https://mail.google.com/mail/u/0/#inbox';
    const webhookUrl = 'https://mail.google.com/mail/u/0/#inbox';
    const payload = getSamplePayload(returnUrl, webhookUrl);

    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/payment-gateway-check/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(json?.error || json?.message || 'Request failed');
        setResponseData(json);
        return;
      }

      const url = json?.data?.url ?? json?.url;
      if (url) {
        window.location.href = url;
        return;
      }

      setStatus('idle');
      setMessage('Payment created successfully (no redirect URL in response).');
      setResponseData(json);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Network error');
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Payment gateway check</h1>
      <p className="text-sm text-gray-600 mb-6">
        Sample page with sample data. Calls <code className="bg-gray-100 px-1 rounded">POST /api/v1/payment-gateway-check/create</code> (createpayment pattern), then redirects to Genie if a URL is returned.
      </p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleCheck}
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium disabled:opacity-50"
        >
          {status === 'loading' ? 'Calling Genie…' : 'Check payment gateway'}
        </button>

        {message && (
          <p className={status === 'error' ? 'text-red-600 text-sm' : 'text-gray-700 text-sm'}>
            {message}
          </p>
        )}

        {responseData && (
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
