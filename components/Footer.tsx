'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-auto" style={{ backgroundColor: '#FFF5F7', borderColor: '#FFE5E9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contact Us */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-base font-bold mb-3" style={{ color: '#B22222', letterSpacing: '0.5px' }}>Contact Us</h3>
            <div className="space-y-2">
              {/* Name with Person Icon */}
              <div className="flex items-start gap-2 group cursor-default">
                <div 
                  className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg transition-all duration-300" 
                  style={{ 
                    backgroundColor: '#FFE5E9',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFD1D9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFE5E9';
                  }}
                >
                  <svg className="w-4 h-4 transition-colors duration-300" style={{ color: '#B22222' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium transition-colors duration-200" style={{ color: '#1F2937' }}>
                    Anchuri Santosh Kumar
                  </p>
                </div>
              </div>

              {/* Phone with Phone Icon */}
              <div className="flex items-start gap-2 group">
                <div 
                  className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg transition-all duration-300" 
                  style={{ 
                    backgroundColor: '#FFE5E9',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFD1D9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFE5E9';
                  }}
                >
                  <svg className="w-4 h-4 transition-colors duration-300" style={{ color: '#B22222' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <a 
                    href="tel:9573166450" 
                    className="text-sm font-medium transition-all duration-200 inline-block" 
                    style={{ color: '#1F2937' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#B22222';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#1F2937';
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    9573166450
                  </a>
                </div>
              </div>

              {/* Address with Location Icon */}
              <div className="flex items-start gap-2 group cursor-default">
                <div 
                  className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg transition-all duration-300" 
                  style={{ 
                    backgroundColor: '#FFE5E9',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFD1D9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFE5E9';
                  }}
                >
                  <svg className="w-4 h-4 transition-colors duration-300" style={{ color: '#B22222' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium leading-relaxed" style={{ color: '#1F2937' }}>
                    B.N.Reddy Nagar, Vanasathalipuram, Hyderabad
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: '#111827' }}>Quick Links</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="text-sm transition-colors" style={{ color: '#374151' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E94B6A'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm transition-colors" style={{ color: '#374151' }} onMouseEnter={(e) => e.currentTarget.style.color = '#16A34A'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm transition-colors" style={{ color: '#374151' }} onMouseEnter={(e) => e.currentTarget.style.color = '#16A34A'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                  Login
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-200">
          <div className="flex flex-col items-center gap-2">
            {/* Social Media Icons */}
            <div className="flex gap-3">
              <a href="#" className="text-zinc-600 transition-colors" style={{ color: '#374151' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E94B6A'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-zinc-600 transition-colors" style={{ color: '#374151' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E94B6A'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-zinc-600 transition-colors" style={{ color: '#374151' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E94B6A'} onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
            </div>
            {/* Copyright and Company Name */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-1">
              <span className="text-xs" style={{ color: '#9CA3AF', fontSize: '11px' }}>GVKSS Software Pvt. Ltd.</span>
              <span className="text-xs" style={{ color: '#9CA3AF', fontSize: '11px' }}>
                © {new Date().getFullYear()} All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
