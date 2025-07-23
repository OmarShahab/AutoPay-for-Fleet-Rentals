'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { CheckCircle, XCircle, Clock, RefreshCw, Bell, Filter, Search, AlertTriangle, TrendingUp, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { LoadingButton, DashboardSkeleton } from '../loading'
import { ErrorAlert, EmptyState } from '../error'

interface PaymentRowProps {
  payment: any
}

function PaymentRow({ payment }: PaymentRowProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      'SUCCESS': {
        badge: 'status-badge success',
        icon: CheckCircle,
        label: 'Success'
      },
      'PENDING': {
        badge: 'status-badge warning',
        icon: Clock,
        label: 'Pending'
      },
      'FAILED': {
        badge: 'status-badge error',
        icon: XCircle,
        label: 'Failed'
      }
    }
    return configs[status as keyof typeof configs] || configs.PENDING
  }

  const statusConfig = getStatusConfig(payment.status)
  const StatusIcon = statusConfig.icon

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
        </div>
        <div className="text-xs text-gray-500">
          {format(new Date(payment.createdAt), 'HH:mm')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {payment.customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
            <div className="text-xs text-gray-500">{payment.subscription?.customer?.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">₹{payment.amount}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
          {payment.type.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={statusConfig.badge}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500 font-mono">
          {payment.transactionId || '-'}
        </div>
      </td>
    </tr>
  )
}

function SubscriptionCard({ subscription, onTriggerNotification }: { 
  subscription: any
  onTriggerNotification: (id: string) => void 
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {subscription.customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{subscription.customer.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>₹{subscription.weeklyAmount}/week</span>
              {subscription.lastDebitDate && (
                <span>Last paid: {format(new Date(subscription.lastDebitDate), 'MMM dd')}</span>
              )}
            </div>
          </div>
        </div>
        <LoadingButton
          loading={false}
          onClick={() => onTriggerNotification(subscription.id)}
          className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
        >
          <Bell className="w-4 h-4" />
          <span>Notify</span>
        </LoadingButton>
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notificationLoading, setNotificationLoading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [paymentsData, subscriptionsData] = await Promise.all([
        api.getPayments(),
        api.getSubscriptions()
      ])
      setPayments(paymentsData.payments)
      setSubscriptions(subscriptionsData.subscriptions)
    } catch (error: any) {
      console.error('Failed to load payments:', error)
      setError(error.message)
      toast.error('Failed to load payment data')
    } finally {
      setLoading(false)
    }
  }

  const triggerPaymentNotification = async (subscriptionId: string) => {
    const subscription = subscriptions.find(s => s.id === subscriptionId)
    if (!subscription) return

    const confirmed = confirm(
      `Send payment notification for ${subscription.customer.name}? PhonePe will execute payment automatically after 24 hours.`
    )
    if (!confirmed) return
    
    try {
      setNotificationLoading(subscriptionId)
      await api.triggerWeeklyPaymentNotification(subscriptionId)
      toast.success('Payment notification sent! PhonePe will execute payment after 24 hours.')
      loadData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setNotificationLoading(null)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    return matchesSearch && payment.status === filter
  })

  const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE')

  // Calculate stats
  const stats = {
    total: payments.length,
    success: payments.filter(p => p.status === 'SUCCESS').length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    failed: payments.filter(p => p.status === 'FAILED').length,
    totalAmount: payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0)
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">
            Track and manage all payment transactions
            <span className="mx-2">•</span>
            <span className="text-sm text-gray-500">{payments.length} total transactions</span>
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <ErrorAlert 
          message={error}
          onDismiss={() => setError(null)}
          actions={
            <button
              onClick={loadData}
              className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          }
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Success</p>
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Subscriptions for Manual Payment Notification */}
      {activeSubscriptions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-blue-900">Active Subscriptions - Payment Notifications</h2>
              <p className="text-sm text-blue-700">Send payment notifications for weekly collections</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-4 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-yellow-500 rounded">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important: PhonePe AutoPay Process</p>
                <p className="mt-1">
                  Clicking "Notify" triggers PhonePe to automatically execute payment after 24 hours. 
                  This follows PhonePe's mandatory notification-execution workflow for recurring payments.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSubscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onTriggerNotification={triggerPaymentNotification}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            {[
              { key: 'all', label: `All (${stats.total})`, className: 'bg-gray-100 text-gray-700' },
              { key: 'SUCCESS', label: `Success (${stats.success})`, className: 'bg-green-100 text-green-700' },
              { key: 'PENDING', label: `Pending (${stats.pending})`, className: 'bg-yellow-100 text-yellow-700' },
              { key: 'FAILED', label: `Failed (${stats.failed})`, className: 'bg-red-100 text-red-700' }
            ].map(({ key, label, className }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filter === key 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : className + ' hover:shadow-md'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full modern-table">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </tbody>
          </table>
          
          {filteredPayments.length === 0 && (
            <EmptyState
              icon={searchTerm ? Search : Calendar}
              title={searchTerm ? "No payments found" : "No payments yet"}
              description={
                searchTerm 
                  ? "Try adjusting your search criteria or filters."
                  : "Payments will appear here once customers complete transactions."
              }
              action={
                !searchTerm && (
                  <button
                    onClick={() => window.location.href = '/customers'}
                    className="btn-primary"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Customers
                  </button>
                )
              }
            />
          )}
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900 mb-2">About Payment Notifications</h3>
            <div className="space-y-2 text-sm text-indigo-800">
              <p>• <strong>Notification:</strong> Alerts customer about upcoming payment deduction</p>
              <p>• <strong>24-hour window:</strong> PhonePe automatically executes payment after notification</p>
              <p>• <strong>Automatic retries:</strong> PhonePe handles failed payment retries internally</p>
              <p>• <strong>Webhooks:</strong> Real-time status updates are received automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}