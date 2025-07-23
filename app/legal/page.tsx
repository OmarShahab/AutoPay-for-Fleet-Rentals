'use client'
import React, { useState } from 'react';
import { Shield, FileText, RefreshCw, Calendar, Mail, Phone, MapPin, Clock, CheckCircle, AlertTriangle, Users, CreditCard, Lock, Eye, UserCheck, Bell } from 'lucide-react';

const LegalPages = () => {
  const [activeTab, setActiveTab] = useState('privacy');

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }:any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-500 text-white shadow-lg' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  const Section = ({ title, children, icon: Icon }:any) => (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="prose prose-gray max-w-none">
        {children}
      </div>
    </div>
  );

  const InfoBox = ({ type = 'info', children }: { type?: 'info' | 'warning' | 'success', children: React.ReactNode }) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      success: 'bg-green-50 border-green-200 text-green-800'
    };
    
    return (
      <div className={`border-l-4 p-4 rounded-r-lg ${styles[type]} mb-4`}>
        {children}
      </div>
    );
  };

  const PrivacyPolicy = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We protect your privacy and ensure secure handling of your personal information for bike rental services.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <InfoBox type="info">
        <p className="font-semibold">Quick Summary:</p>
        <p>We collect minimal information for bike rentals, use secure PhonePe payments, and never sell your data.</p>
      </InfoBox>

      <Section title="Information We Collect" icon={Users}>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Personal:</strong> Name, email, phone number</li>
          <li><strong>Payment:</strong> UPI ID for automated payments</li>
          <li><strong>Rental:</strong> Bike preferences, rental history</li>
          <li><strong>Technical:</strong> IP address, browser type when using our website</li>
        </ul>
      </Section>

      <Section title="How We Use Your Information" icon={Eye}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Service Delivery</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Process bike rentals</li>
              <li>Manage weekly payments</li>
              <li>Send service notifications</li>
              <li>Provide customer support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Business Operations</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Improve our services</li>
              <li>Analyze usage patterns</li>
              <li>Legal compliance</li>
              <li>Fraud prevention</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Data Security" icon={Lock}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Encrypted data transmission (SSL/TLS)</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Secure database storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">PhonePe secure payment processing</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Access controls</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Regular security audits</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Employee training</span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );

  const TermsConditions = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please read these terms carefully before using our bike rental services.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <InfoBox type="warning">
        <p className="font-semibold">Important:</p>
        <p>By using our services, you agree to these Terms and Conditions.</p>
      </InfoBox>

      <Section title="Service Description" icon={Users}>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Weekly bike rental with automated payment collection</li>
          <li>UPI-based payment processing through PhonePe AutoPay</li>
          <li>Online booking and management platform</li>
          <li>Customer support and maintenance services</li>
        </ul>
        <p className="text-gray-700 mt-4">Currently serving customers in Noida, India and surrounding areas.</p>
      </Section>

      <Section title="Eligibility & Account" icon={UserCheck}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Must be 18+ years old</li>
              <li>Valid government ID</li>
              <li>Valid UPI ID</li>
              <li>Accurate information</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Responsibilities</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Keep account secure</li>
              <li>Report unauthorized access</li>
              <li>Update contact information</li>
              <li>Use service lawfully</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Rental Terms" icon={Bell}>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">Payment Schedule</h4>
          <ul className="space-y-1 text-blue-800">
            <li>• Weekly payments collected every Monday automatically</li>
            <li>• 24-hour notification before payment execution</li>
            <li>• Service suspension for non-payment after 7 days</li>
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Allowed Uses</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
              <li>Personal transportation</li>
              <li>Recreational riding</li>
              <li>Commuting</li>
              <li>Exercise</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Prohibited</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
              <li>Commercial delivery</li>
              <li>Racing or stunts</li>
              <li>Subletting to others</li>
              <li>Unauthorized modifications</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Liability" icon={Shield}>
        <InfoBox type="warning">
          <p><strong>Important:</strong> Renters are responsible for their safety and any damages during rental.</p>
        </InfoBox>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>We are not liable for personal injuries or accidents</li>
          <li>Renters assume full responsibility for bike usage</li>
          <li>Report theft or damage within 24 hours</li>
          <li>Follow all traffic laws and safety regulations</li>
        </ul>
      </Section>
    </div>
  );

  const RefundPolicy = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Fair and transparent refund terms for our bike rental services.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <InfoBox type="success">
        <p className="font-semibold">Our Commitment:</p>
        <p>Eligible refunds processed within 3-5 business days to your original payment method.</p>
      </InfoBox>

      <Section title="Refund Eligibility" icon={CheckCircle}>
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Full Refund Eligible</h4>
            <ul className="space-y-1 text-green-800">
              <li>• Cancellation within 24 hours of setup</li>
              <li>• Bike unavailable due to maintenance</li>
              <li>• Service disruption due to company fault</li>
              <li>• Duplicate or erroneous charges</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Partial Refund</h4>
            <ul className="space-y-1 text-yellow-800">
              <li>• Cancellation after 24 hours but within 7 days (pro-rated)</li>
              <li>• Early termination by customer (unused period)</li>
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">No Refund</h4>
            <ul className="space-y-1 text-red-800">
              <li>• Change of mind after using service</li>
              <li>• Damage due to user negligence</li>
              <li>• Violation of terms</li>
              <li>• Service used for more than 7 days</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Refund Process" icon={RefreshCw}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How to Request</h4>
            <ol className="list-decimal pl-6 space-y-1 text-gray-700">
              <li>Contact support with transaction details</li>
              <li>Provide reason for refund request</li>
              <li>Submit supporting documents if needed</li>
              <li>Wait for review and processing</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Processing Time</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Review</span>
                <span className="text-sm bg-blue-100 px-2 py-1 rounded">1-2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Processing</span>
                <span className="text-sm bg-green-100 px-2 py-1 rounded">3-5 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Bank Credit</span>
                <span className="text-sm bg-purple-100 px-2 py-1 rounded">5-7 days</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <TabButton
              id="privacy"
              label="Privacy Policy"
              icon={Shield}
              isActive={activeTab === 'privacy'}
              onClick={setActiveTab}
            />
            <TabButton
              id="terms"
              label="Terms & Conditions"
              icon={FileText}
              isActive={activeTab === 'terms'}
              onClick={setActiveTab}
            />
            <TabButton
              id="refund"
              label="Refund Policy"
              icon={RefreshCw}
              isActive={activeTab === 'refund'}
              onClick={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {activeTab === 'privacy' && <PrivacyPolicy />}
          {activeTab === 'terms' && <TermsConditions />}
          {activeTab === 'refund' && <RefundPolicy />}
        </div>

        {/* Company Info & Contact */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">prateek@lilypad.co.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">+91 9211739780</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Sector 16B, Noida, Uttar Pradesh 201301</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Mon-Fri: 9:00 AM - 6:00 PM</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Lilypad Tech Private Limited</strong><br/>
                  GST: 09AAFCL4737M1ZZ<br/>
                  WeWork Berger Delhi One, C-001/A2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 Lilypad Tech Private Limited. All rights reserved.</p>
          <p className="mt-2">
            For questions about these policies, contact us at{' '}
            <a href="mailto:prateek@lilypad.co.in" className="text-blue-600 hover:underline">
              prateek@lilypad.co.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPages;