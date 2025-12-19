'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface PhoneRegion {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: string;
  placeholder: string;
  digits: number;
}

export default function AICallAgent() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'in-call' | 'completed' | 'failed'>('idle');
  const [callProgress, setCallProgress] = useState(0);
  const [callId, setCallId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const phoneRegions: PhoneRegion[] = [
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(XXX) XXX-XXXX', placeholder: '(555) 123-4567', digits: 10 },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '(XXX) XXX-XXXX', placeholder: '(416) 123-4567', digits: 10 },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: 'XXXX XXX XXXX', placeholder: '7700 900123', digits: 10 },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: 'XXX XXX XXX', placeholder: '412 345 678', digits: 9 },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', format: 'XXXXX XXXXX', placeholder: '98765 43210', digits: 10 },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', format: 'XXX XXXX XXXX', placeholder: '138 0013 8000', digits: 11 },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: 'XX-XXXX-XXXX', placeholder: '90-1234-5678', digits: 10 },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: 'XXX XXXXXXXX', placeholder: '151 12345678', digits: 11 },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: 'X XX XX XX XX', placeholder: '6 12 34 56 78', digits: 9 },
    { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', format: 'XXX XXX XXXX', placeholder: '312 345 6789', digits: 10 },
    { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', format: 'XXX XX XX XX', placeholder: '612 34 56 78', digits: 9 },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', format: '(XX) XXXXX-XXXX', placeholder: '(11) 91234-5678', digits: 11 },
    { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', format: 'XX XXXX XXXX', placeholder: '55 1234 5678', digits: 10 },
    { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', format: 'XX XXXX-XXXX', placeholder: '11 2345-6789', digits: 10 },
    { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', format: 'XX XXX XXXX', placeholder: '71 123 4567', digits: 9 },
    { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', format: 'XXX XXX XXXX', placeholder: '802 123 4567', digits: 10 },
    { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', format: 'XXX XXX XXXX', placeholder: '100 123 4567', digits: 10 },
    { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', format: 'XXX XXXXXX', placeholder: '712 345678', digits: 9 },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', format: 'XXXX XXXX', placeholder: '8123 4567', digits: 8 },
    { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', format: 'XX-XXX XXXX', placeholder: '12-345 6789', digits: 10 },
    { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', format: 'XX XXX XXXX', placeholder: '81 234 5678', digits: 9 },
    { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', format: 'XXX XXX XXXX', placeholder: '917 123 4567', digits: 10 },
    { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', format: 'XXX-XXXX-XXXX', placeholder: '812-3456-7890', digits: 11 },
    { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', format: 'XXX XXX XXXX', placeholder: '912 345 678', digits: 9 },
    { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', format: 'XXX XXXXXXX', placeholder: '301 2345678', digits: 10 },
    { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', format: 'XXXX-XXXXXX', placeholder: '1812-345678', digits: 10 },
    { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', format: 'XXX XXX-XX-XX', placeholder: '912 345-67-89', digits: 10 },
    { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', format: 'XXX XXX XXXX', placeholder: '532 123 4567', digits: 10 },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', format: 'XX XXX XXXX', placeholder: '50 123 4567', digits: 9 },
    { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', format: 'XX XXX XXXX', placeholder: '50 123 4567', digits: 9 },
    { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', format: 'XX-XXX-XXXX', placeholder: '50-123-4567', digits: 9 },
    { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', format: 'XX-XXXX-XXXX', placeholder: '10-1234-5678', digits: 10 },
    { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', format: 'XX XXX XXXX', placeholder: '21 123 4567', digits: 9 },
    { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', format: 'X XX XX XX XX', placeholder: '6 12 34 56 78', digits: 9 },
    { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', format: 'XXX XX XX XX', placeholder: '470 12 34 56', digits: 9 },
    { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', format: 'XX-XXX XX XX', placeholder: '70-123 45 67', digits: 9 },
    { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', format: 'XXX XX XXX', placeholder: '412 34 567', digits: 8 },
    { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', format: 'XX XX XX XX', placeholder: '32 12 34 56', digits: 8 },
    { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', format: 'XX XXX XXXX', placeholder: '41 123 4567', digits: 9 },
    { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', format: 'XXX XXX XXX', placeholder: '512 345 678', digits: 9 },
    { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', format: 'XX XXX XX XX', placeholder: '50 123 45 67', digits: 9 },
  ];

  const formatPhoneNumber = (value: string, regionCode: string): string => {
    const region = phoneRegions.find(r => r.code === regionCode);
    if (!region) return value;

    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, region.digits);
    
    switch (regionCode) {
      case 'US':
      case 'CA':
        if (limited.length <= 3) return limited;
        if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
        return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6, 10)}`;
      
      case 'BR':
        if (limited.length <= 2) return limited;
        if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
      
      case 'GB':
        if (limited.length <= 4) return limited;
        if (limited.length <= 7) return `${limited.slice(0, 4)} ${limited.slice(4)}`;
        return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7, 10)}`;
      
      case 'AU':
        if (limited.length <= 3) return limited;
        if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
        return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)}`;
      
      case 'IN':
        if (limited.length <= 5) return limited;
        return `${limited.slice(0, 5)} ${limited.slice(5, 10)}`;
      
      case 'CN':
        if (limited.length <= 3) return limited;
        if (limited.length <= 7) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
        return `${limited.slice(0, 3)} ${limited.slice(3, 7)} ${limited.slice(7, 11)}`;
      
      case 'JP':
      case 'KR':
        if (limited.length <= 2) return limited;
        if (limited.length <= 6) return `${limited.slice(0, 2)}-${limited.slice(2)}`;
        return `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6, 10)}`;
      
      case 'FR':
        if (limited.length <= 1) return limited;
        if (limited.length <= 3) return `${limited.slice(0, 1)} ${limited.slice(1)}`;
        if (limited.length <= 5) return `${limited.slice(0, 1)} ${limited.slice(1, 3)} ${limited.slice(3)}`;
        if (limited.length <= 7) return `${limited.slice(0, 1)} ${limited.slice(1, 3)} ${limited.slice(3, 5)} ${limited.slice(5)}`;
        return `${limited.slice(0, 1)} ${limited.slice(1, 3)} ${limited.slice(3, 5)} ${limited.slice(5, 7)} ${limited.slice(7, 9)}`;
      
      case 'DE':
      case 'NG':
      case 'EG':
      case 'MX':
        if (limited.length <= 3) return limited;
        return `${limited.slice(0, 3)} ${limited.slice(3)}`;
      
      case 'IT':
      case 'PH':
      case 'PK':
      case 'TR':
        if (limited.length <= 3) return limited;
        if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
        return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
      
      case 'ES':
      case 'SA':
      case 'AE':
      case 'NZ':
      case 'TH':
      case 'VN':
      case 'IL':
      case 'PL':
      case 'UA':
      case 'FI':
        if (limited.length <= 3) return limited;
        if (limited.length <= 5) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
        return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5)}`;
      
      case 'AR':
      case 'ZA':
        if (limited.length <= 2) return limited;
        return `${limited.slice(0, 2)} ${limited.slice(2)}`;
      
      case 'SG':
        if (limited.length <= 4) return limited;
        return `${limited.slice(0, 4)} ${limited.slice(4, 8)}`;
      
      case 'MY':
        if (limited.length <= 2) return limited;
        if (limited.length <= 5) return `${limited.slice(0, 2)}-${limited.slice(2)}`;
        return `${limited.slice(0, 2)}-${limited.slice(2, 5)} ${limited.slice(5)}`;
      
      case 'ID':
        if (limited.length <= 3) return limited;
        if (limited.length <= 7) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
        return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7, 11)}`;
      
      case 'KE':
      case 'NL':
      case 'BE':
      case 'SE':
        if (limited.length <= 3) return limited;
        return `${limited.slice(0, 3)} ${limited.slice(3)}`;
      
      case 'NO':
      case 'DK':
        if (limited.length <= 2) return limited;
        if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
        if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
        return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)}`;
      
      case 'BD':
      case 'RU':
        if (limited.length <= 4) return limited;
        return `${limited.slice(0, 4)}-${limited.slice(4)}`;
      
      default:
        return limited;
    }
  };

  const handleStartCall = async () => {
    setErrorMessage('');

    if (!phoneNumber) {
      setErrorMessage('Please enter a phone number');
      return;
    }

    const region = phoneRegions.find(r => r.code === selectedRegion);
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    if (region && cleanedNumber.length !== region.digits) {
      setErrorMessage(`Please enter a valid ${region.name} phone number (${region.digits} digits required)`);
      return;
    }

    setIsProcessing(true);
    setCallStatus('calling');
    setCallProgress(10);

    try {
      const fullPhoneNumber = `${region?.dialCode}${cleanedNumber}`;

      console.log('Initiating VAPI call to:', fullPhoneNumber);

      // Call your VAPI API endpoint
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate call');
      }

      console.log('VAPI call initiated:', data.callId);

      setCallId(data.callId);
      setCallProgress(30);
      setCallStatus('in-call');

      pollCallStatus(data.callId);
    } catch (error) {
      console.error('Call error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start call');
      setCallStatus('failed');
      setIsProcessing(false);
      setCallProgress(0);
    }
  };

  const pollCallStatus = (id: string) => {
    let pollCount = 0;
    const maxPolls = 300;

    const interval = setInterval(async () => {
      pollCount++;

      try {
        const response = await fetch(`/api/call?callId=${id}`);
        const data = await response.json();

        console.log('Call status:', data.status);

        setCallProgress(prev => Math.min(prev + 2, 95));

        if (data.status === 'completed' || data.status === 'ended') {
          setCallProgress(100);
          setCallStatus('completed');
          setIsProcessing(false);
          clearInterval(interval);
        } else if (data.status === 'failed' || data.status === 'error') {
          setCallStatus('failed');
          setIsProcessing(false);
          setErrorMessage('Call failed');
          clearInterval(interval);
        }

        if (pollCount >= maxPolls) {
          clearInterval(interval);
          setCallStatus('completed');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    }, 2000);
  };

  const handleReset = () => {
    setCallStatus('idle');
    setCallProgress(0);
    setIsProcessing(false);
    setCallId(null);
    setErrorMessage('');
  };

  const getFullPhoneNumber = () => {
    const region = phoneRegions.find(r => r.code === selectedRegion);
    return `${region?.dialCode} ${phoneNumber}`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">AI Call Agent</h1>
              <p className="mt-1 text-sm text-muted-foreground">VAPI-powered AI assistant for automated calls</p>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {errorMessage && (
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-destructive mb-1">Error</h4>
              <p className="text-sm text-destructive/80">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-destructive/60 hover:text-destructive transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phone Number Input */}
            <div className="bg-card border border-border rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
              <label className="block text-sm font-medium text-foreground mb-3">
                Phone Number <span className="text-destructive">*</span>
              </label>
              
              <div className="space-y-3">
                {/* Country/Region Selector */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Country/Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setPhoneNumber('');
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm bg-background text-foreground"
                    disabled={callStatus !== 'idle'}
                  >
                    {phoneRegions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.flag} {region.name} ({region.dialCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-r border-border bg-muted rounded-l-lg">
                      <span className="text-sm text-muted-foreground pr-3">
                        {phoneRegions.find(r => r.code === selectedRegion)?.dialCode}
                      </span>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value, selectedRegion))}
                      placeholder={phoneRegions.find(r => r.code === selectedRegion)?.placeholder}
                      className="w-full pl-20 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                      disabled={callStatus !== 'idle'}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Enter the complete phone number with area code</span>
              </div>
            </div>

            {/* Assistant Info */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">AI Assistant: Ryvon</h3>
                  <p className="text-xs text-muted-foreground">Your pre-trained VAPI assistant will handle the call with a professional, engaging conversation tailored to your product.</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {callStatus === 'idle' && (
              <button
                onClick={handleStartCall}
                disabled={isProcessing}
                className="w-full px-6 py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg font-medium transition-all flex items-center justify-center gap-3 text-base shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Start AI Call
              </button>
            )}

            {callStatus === 'completed' && (
              <button
                onClick={handleReset}
                className="w-full px-6 py-4 border border-border hover:bg-secondary text-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-3 text-base"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Make Another Call
              </button>
            )}
          </div>

          {/* Right Column - Status */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {/* Call Status Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Call Status</h3>
                
                {callStatus === 'idle' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">Ready to initiate call</p>
                  </div>
                )}

                {callStatus === 'calling' && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">Connecting...</p>
                      <p className="text-xs text-muted-foreground">Dialing {getFullPhoneNumber()}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{callProgress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300 ease-out"
                          style={{ width: `${callProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {callStatus === 'in-call' && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                        <div className="relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Call in Progress</p>
                      <p className="text-xs text-muted-foreground">Ryvon is handling the call</p>
                    </div>

                    <div className="space-y-3 bg-muted rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Greeting customer</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Delivering pitch</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-muted-foreground/30 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground/50">Handling questions</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{callProgress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-green-500 h-full transition-all duration-300 ease-out"
                          style={{ width: `${callProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {callStatus === 'completed' && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">Call Completed</p>
                      <p className="text-xs text-muted-foreground">Successfully delivered pitch</p>
                    </div>

                    <div className="bg-green-500/10 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium text-green-600 dark:text-green-400">Success</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Call ID</span>
                        <span className="font-medium text-foreground">{callId?.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                )}

                {callStatus === 'failed' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Call Failed</p>
                    <p className="text-xs text-muted-foreground">Please try again</p>
                  </div>
                )}
              </div>

              {/* Quick Tips */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">How It Works</h4>
                    <ul className="text-xs text-blue-600/80 dark:text-blue-400/80 space-y-1">
                      <li>• Enter any valid phone number</li>
                      <li>• Ryvon AI handles the conversation</li>
                      <li>• Professional product pitching</li>
                      <li>• Powered by VAPI + Twilio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}