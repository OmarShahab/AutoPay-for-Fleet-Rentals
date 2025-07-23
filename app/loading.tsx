import React from 'react'

// Main loading component
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin"></div>
        {/* Inner ring with gradient */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700">Loading...</p>
        <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
      </div>
    </div>
  )
}

// Skeleton loading for stats cards
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-8 w-16"></div>
        </div>
        <div className="skeleton h-12 w-12 rounded-xl"></div>
      </div>
    </div>
  )
}

// Skeleton loading for table rows
export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="skeleton h-4 w-full max-w-[120px]"></div>
        </td>
      ))}
    </tr>
  )
}

// Skeleton loading for forms
export function FormSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-6">
      <div className="skeleton h-6 w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-12 w-full rounded-lg"></div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-10 w-32 rounded-lg"></div>
        <div className="skeleton h-10 w-20 rounded-lg"></div>
      </div>
    </div>
  )
}

// Skeleton loading for dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 fade-in">
      {/* Header skeleton */}
      <div className="skeleton h-10 w-48"></div>
      
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>
      
      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="skeleton h-6 w-40"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-6 py-4">
                    <div className="skeleton h-4 w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Full page loading with backdrop
export function FullPageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 text-center space-y-4">
        <div className="relative mx-auto">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700">{message}</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      </div>
    </div>
  )
}

// Loading button state
export function LoadingButton({ 
  loading, 
  children, 
  className = "", 
  ...props 
}: { 
  loading: boolean
  children: React.ReactNode
  className?: string
  [key: string]: any
}) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`relative inline-flex items-center justify-center ${className} ${
        loading ? 'cursor-not-allowed opacity-70' : ''
      }`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </button>
  )
}