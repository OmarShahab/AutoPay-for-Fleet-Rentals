'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { Plus, CheckCircle, XCircle, Clock, Copy, Mail, Phone, Search, Filter, UserPlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { FormSkeleton, LoadingButton } from '../loading'
import { ErrorAlert, InlineError } from '../error'

interface FormData {
  name: string
  email: string
  upiId: string
  phone: string
}

interface FormErrors {
  [key: string]: string
}

function StatusBadge({ status }: { status: string }) {
  const badges = {
    'ACTIVE': {
      icon: CheckCircle,
      className: 'status-badge success',
      label: 'Active'
    },
    'PENDING': {
      icon: Clock,
      className: 'status-badge warning',
      label: 'Pending'
    },
    'FAILED': {
      icon: XCircle,
      className: 'status-badge error',
      label: 'Failed'
    },
    'CANCELLED': {
      icon: XCircle,
      className: 'status-badge error',
      label: 'Cancelled'
    }
  }

  const badge = badges[status as keyof typeof badges]
  if (!badge) return <span className="text-gray-500">{status}</span>

  const Icon = badge.icon
  return (
    <span className={badge.className}>
      <Icon className="w-3 h-3 mr-1" />
      {badge.label}
    </span>
  )
}

function CustomerForm({ 
  isVisible, 
  onClose, 
  onSuccess 
}: { 
  isVisible: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    upiId: '',
    phone: ''
  })
  const [weeklyAmount, setWeeklyAmount] = useState(500)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.upiId.trim()) newErrors.upiId = 'UPI ID is required'
    else if (!/\S+@\S+/.test(formData.upiId)) newErrors.upiId = 'Invalid UPI ID format'
    if (weeklyAmount < 3) newErrors.weeklyAmount = 'Minimum amount is ₹3'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      // Create customer
      const customerRes = await api.createCustomer(formData)
      const customer = customerRes.customer
      
      // Create mandate
      const mandateRes = await api.createMandate({
        customerId: customer.id,
        weeklyAmount
      })
      
      toast.success('Customer created! Mandate authorization initiated.')
      
      // Copy mandate URL if available
      if (mandateRes.subscription.mandateUrl) {
        navigator.clipboard.writeText(mandateRes.subscription.mandateUrl)
        toast.success('Mandate URL copied to clipboard!')
      }
      
      // Reset form
      setFormData({ name: '', email: '', upiId: '', phone: '' })
      setWeeklyAmount(500)
      setErrors({})
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
                <p className="text-sm text-gray-500">Create customer and setup weekly payment mandate</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="modern-input w-full"
                  placeholder="Enter full name"
                />
                {errors.name && <InlineError message={errors.name} />}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="modern-input w-full"
                  placeholder="Enter email address"
                />
                {errors.email && <InlineError message={errors.email} />}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                  className="modern-input w-full"
                  placeholder="username@paytm"
                />
                {errors.upiId && <InlineError message={errors.upiId} />}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="modern-input w-full"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Weekly Rent Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="3"
                  value={weeklyAmount}
                  onChange={(e) => setWeeklyAmount(Number(e.target.value))}
                  className="modern-input w-full"
                  placeholder="Enter weekly amount"
                />
                {errors.weeklyAmount && <InlineError message={errors.weeklyAmount} />}
              </div>
            </div>

            {/* Info panel */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-blue-100 rounded">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">What happens next?</p>
                  <p className="mt-1">
                    1. Customer will be created in the system<br/>
                    2. PhonePe mandate authorization will be initiated<br/>
                    3. Customer will receive UPI collect request to approve the mandate
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <LoadingButton
                loading={loading}
                type="submit"
                className="btn-primary flex-1"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Customer & Setup Mandate
              </LoadingButton>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [customersData, subscriptionsData] = await Promise.all([
        api.getCustomers(),
        api.getSubscriptions()
      ])
      setCustomers(customersData.customers)
      setSubscriptions(subscriptionsData.subscriptions)
    } catch (error: any) {
      console.error('Failed to load customers:', error)
      setError(error.message)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async (subscriptionId: string) => {
    try {
      const res = await api.checkMandateStatus(subscriptionId)
      toast.success(`Status updated: ${res.status}`)
      loadData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getSubscriptionForCustomer = (customerId: string) => {
    return subscriptions.find(s => s.customerId === customerId)
  }

  const filteredCustomers = customers.filter(customer => {
    const subscription = getSubscriptionForCustomer(customer.id)
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.upiId.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    return matchesSearch && subscription?.status === filterStatus
  })

  if (loading) return <FormSkeleton />

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">
            Manage bike rental customers and their payment mandates
            <span className="mx-2">•</span>
            <span className="text-sm text-gray-500">{customers.length} total customers</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
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

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers by name, email, or UPI ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full modern-table">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mandate Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weekly Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const subscription = getSubscriptionForCustomer(customer.id)
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                            {customer.upiId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscription ? <StatusBadge status={subscription.status} /> : (
                        <span className="text-gray-400 text-sm">No mandate</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription ? `₹${subscription.weeklyAmount}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription?.nextDebitDate 
                        ? format(new Date(subscription.nextDebitDate), 'MMM dd, yyyy')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscription && (
                        <button
                          onClick={() => checkStatus(subscription.merchantSubscriptionId)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                        >
                          Check Status
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first customer.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Customer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        isVisible={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={loadData}
      />
    </div>
  )
}