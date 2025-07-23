'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import LoginPage from '@/components/loginpage'
import { LogOut, User } from 'lucide-react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname === '/') return 'dashboard'
    if (pathname.startsWith('/customers')) return 'customers'
    if (pathname.startsWith('/payments')) return 'payments'
    if (pathname.startsWith('/legal')) return 'legal'
    return 'dashboard'
  }
  
  const activeTab = getActiveTab()
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: '📊' },
    { id: 'customers', label: 'Customers', href: '/customers', icon: '👥' },
    { id: 'payments', label: 'Payments', href: '/payments', icon: '💳' },
    { id: 'legal', label: 'Legal', href: '/legal', icon: '📋' },
  ]

  return (
    <nav className="relative">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Navigation content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and brand */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  🚴
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-30"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Bike Rental System</h1>
                <p className="text-sm text-white/70">Powered by PhonePe AutoPay</p>
              </div>
            </div>

            {/* Navigation links - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === item.id
                      ? 'text-white bg-white/20 backdrop-blur-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  {activeTab === item.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  )}
                </a>
              ))}
            </div>

            {/* User menu - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/80">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === item.id
                        ? 'text-white bg-white/20 backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
                
                {/* Mobile user menu */}
                <div className="border-t border-white/20 pt-4 mt-4">
                  <div className="flex items-center space-x-2 text-white/80 px-4 py-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Logged in as: {user?.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom border gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </nav>
  )
}

function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Main content area */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2025 Bike Rental Management System. 
              <span className="mx-2">•</span>
              Built with Next.js & PhonePe AutoPay
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <AuthenticatedApp>
            {children}
          </AuthenticatedApp>

          {/* Enhanced toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                color: '#1f2937',
                fontSize: '14px',
                padding: '16px',
              },
              success: {
                style: {
                  background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                  color: '#065f46',
                },
              },
              error: {
                style: {
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                  color: '#991b1b',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}