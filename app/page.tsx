'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle, Clock, IndianRupee, Users, TrendingUp, Calendar, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardSkeleton } from './loading'
import { ErrorAlert, EmptyState } from './error'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<any>
  gradient: string
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
}

function StatCard({ title, value, icon: Icon, gradient, trend, subtitle }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover-lift">
      {/* Background gradient */}
      <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          
          <div className={`relative p-3 ${gradient} rounded-xl shadow-lg`}>
            <Icon className="h-8 w-8 text-white" />
            <div className={`absolute inset-0 ${gradient} rounded-xl blur opacity-50`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OverdueRowProps {
  subscription: any
}

function OverdueRow({ subscription }: OverdueRowProps) {
  return (
    <tr className="hover:bg-red-50 border-b border-gray-100 transition-colors duration-200">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {subscription.customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{subscription.customer.name}</p>
            <p className="text-sm text-gray-500">{subscription.customer.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {subscription.customer.upiId}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-gray-900 font-semibold">
          <IndianRupee className="w-4 h-4 mr-1" />
          {subscription.weeklyAmount}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-4 h-4 mr-1" />
          {subscription.weeksOverdue} weeks
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center font-bold text-red-600">
          <IndianRupee className="w-4 h-4 mr-1" />
          {subscription.weeklyAmount * subscription.weeksOverdue}
        </div>
      </td>
    </tr>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getDashboardStats()
      setStats(data.stats)
    } catch (error: any) {
      console.error('Dashboard loading error:', error)
      setError(error.message || 'Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }


  if (loading) return <DashboardSkeleton />

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <ErrorAlert 
          title="Failed to load dashboard"
          message={error}
          actions={
            <button
              onClick={loadDashboard}
              className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your bike rental business
            <span className="mx-2">•</span>
            <span className="text-sm text-gray-500">
              Last updated {format(new Date(), 'MMM dd, yyyy at HH:mm')}
            </span>
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="btn-primary flex items-center space-x-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Mandates"
          value={stats?.activeMandates || 0}
          icon={Users}
          gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
          trend={{ value: 12, isPositive: true }}
          subtitle="Total active subscriptions"
        />
        
        <StatCard
          title="Pending This Week"
          value={stats?.pendingThisWeek || 0}
          icon={Clock}
          gradient="bg-gradient-to-r from-amber-500 to-orange-500"
          subtitle="Scheduled for payment"
        />
        
        <StatCard
          title="Overdue Payments"
          value={stats?.overdueCount || 0}
          icon={AlertCircle}
          gradient="bg-gradient-to-r from-red-500 to-pink-500"
          subtitle="Require immediate attention"
        />
        
        <StatCard
          title="Monthly Collection"
          value={`₹${stats?.monthlyCollection || 0}`}
          icon={IndianRupee}
          gradient="bg-gradient-to-r from-green-500 to-emerald-500"
          trend={{ value: 8, isPositive: true }}
          subtitle="This month's revenue"
        />
      </div>

      {/* Overdue Subscriptions Table */}
      {stats?.overdueSubscriptions?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden slide-up">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Overdue Payments</h2>
                <p className="text-red-100 text-sm">
                  {stats.overdueSubscriptions.length} customers require immediate attention
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full modern-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UPI ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weekly Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Due
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.overdueSubscriptions.map((sub: any) => (
                  <OverdueRow key={sub.id} subscription={sub} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add New Customer</h3>
              <p className="text-sm text-gray-500">Set up a new bike rental subscription</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/customers"
              className="block w-full text-center py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              Go to Customers
            </a>
          </div>
        </div>
     
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <IndianRupee className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Payments</h3>
              <p className="text-sm text-gray-500">Track all payment transactions</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/payments"
              className="block w-full text-center py-2 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
            >
              View Payments
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Payment Notifications</h3>
              <p className="text-sm text-gray-500">Manage weekly payment reminders</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="block w-full text-center py-2 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium">
              Configure Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Automated Payment Schedule</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Automatic payments are processed every <strong>Monday at 9:00 AM</strong> for all active mandates. 
              The system uses PhonePe's AutoPay feature with a notify-then-execute workflow for reliable payment collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}