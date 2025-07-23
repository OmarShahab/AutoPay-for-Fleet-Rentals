// =============================================================================
// 7. UPDATE: lib/api.ts (replace your existing api.ts)
// =============================================================================
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || ''

function getAuthHeaders() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bike_admin_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }
  return {}
}

async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    //@ts-ignore
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  })
  
  if (res.status === 401) {
    // Token expired or invalid - redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bike_admin_token')
      window.location.reload()
    }
    throw new Error('Authentication failed')
  }
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Something went wrong')
  }
  
  return res.json()
}

export const api = {
  // Customer APIs
  createCustomer: (data: { name: string; email: string; upiId: string; phone?: string }) =>
    fetcher('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
  
  getCustomers: () => fetcher('/api/customers'),
  
  // Mandate APIs
  createMandate: (data: { customerId: string; weeklyAmount: number }) =>
    fetcher('/api/mandate/create', { method: 'POST', body: JSON.stringify(data) }),
  
  checkMandateStatus: (subscriptionId: string) =>
    fetcher(`/api/mandate/${subscriptionId}/status`),
  
  cancelMandate: (subscriptionId: string) =>
    fetcher(`/api/mandate/${subscriptionId}/cancel`, { method: 'POST' }),
  
  // Subscription & Payment APIs
  getSubscriptions: () => fetcher('/api/subscriptions'),
  
  getPayments: () => fetcher('/api/payments'),
  
  // Dashboard API
  getDashboardStats: () => fetcher('/api/dashboard/stats'),
  
  // Payment notification trigger
  triggerWeeklyPaymentNotification: (subscriptionId: string) =>
    fetcher(`/api/payment/weekly-debit/${subscriptionId}`, { method: 'POST' }),
}