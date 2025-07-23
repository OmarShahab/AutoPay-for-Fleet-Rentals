'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

// Main error boundary component
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error icon with animation */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Error content */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We encountered an unexpected error. Don't worry, our team has been notified and we're working on fixing it.
          </p>
          
          {/* Error details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Technical Details
              </summary>
              <div className="mt-2 text-xs text-gray-600 font-mono break-all">
                {error.message}
                {error.digest && (
                  <div className="mt-2">
                    <strong>Error ID:</strong> {error.digest}
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}

// Inline error component for form fields or sections
export function InlineError({ 
  message, 
  className = "" 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={`flex items-center space-x-2 text-red-600 text-sm ${className}`}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// Error alert component
export function ErrorAlert({ 
  title = "Error", 
  message, 
  onDismiss,
  actions
}: {
  title?: string
  message: string
  onDismiss?: () => void
  actions?: React.ReactNode
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 fade-in">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {actions && (
            <div className="mt-3">{actions}</div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md text-red-400 hover:text-red-500 focus:outline-none"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Empty state component
export function EmptyState({ 
  icon: Icon = AlertTriangle,
  title,
  description,
  action
}: {
  icon?: React.ComponentType<any>
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  )
}

// Network error component
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Connection Problem</h3>
          <p className="text-gray-500 mt-1">
            Please check your internet connection and try again.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    </div>
  )
}

// 404 Not Found component
export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold text-gray-300">404</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </a>
        </div>
      </div>
    </div>
  )
}