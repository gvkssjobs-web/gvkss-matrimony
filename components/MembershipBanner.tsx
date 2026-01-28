'use client';

import Link from 'next/link';

interface MembershipPlan {
  name: string;
  role: 'silver' | 'gold' | 'platinum';
  color: string;
  textColor: string;
  icon: string;
  features: string[];
  price: string;
}

export default function MembershipBanner() {
  const membershipPlans: MembershipPlan[] = [
    {
      name: 'Silver',
      role: 'silver',
      color: 'bg-gradient-to-br from-zinc-50 via-white to-zinc-50 border-zinc-300',
      textColor: 'text-zinc-900',
      icon: '🥈',
      features: [],
      price: '₹1,500/Month'
    },
    {
      name: 'Gold',
      role: 'gold',
      color: 'bg-gradient-to-br from-yellow-50 via-white to-yellow-50/50 border-yellow-300',
      textColor: 'text-yellow-900',
      icon: '🥇',
      features: [],
      price: '₹2,500/Month'
    },
    {
      name: 'Platinum',
      role: 'platinum',
      color: 'bg-gradient-to-br from-blue-50 via-white to-blue-50/50 border-blue-300',
      textColor: 'text-blue-900',
      icon: '💎',
      features: [],
      price: '₹5,000/Month'
    }
  ];

  return (
    <div className="w-full mb-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent mb-3" style={{ backgroundImage: 'linear-gradient(to right, #111827, #E94B6A, #111827)' }}>
          Choose Your Plan
        </h1>
        <p className="text-lg" style={{ color: '#374151' }}>Select the perfect membership for you</p>
      </div>

      {/* Membership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membershipPlans.map((plan) => (
          <div
            key={plan.role}
            data-plan={plan.role}
            className={`${plan.color} border-2 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] group relative overflow-hidden`}
          >
            {/* Background Glow Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              plan.role === 'gold' ? 'bg-gradient-to-br from-yellow-500/10 to-transparent' :
              plan.role === 'platinum' ? 'bg-gradient-to-br from-blue-500/10 to-transparent' :
              'bg-gradient-to-br from-zinc-500/10 to-transparent'
            }`} />
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{plan.icon}</div>
                <h3 className={`text-3xl font-extrabold ${plan.textColor} mb-3`}>{plan.name}</h3>
                <div className={`text-4xl font-black ${plan.textColor} mb-2`}>{plan.price}</div>
              </div>
              
              <ul className={`space-y-3 mb-8 ${plan.textColor}`}>
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className={`w-5 h-5 ${plan.textColor} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/"
                className={`block w-full text-center py-4 px-6 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                  plan.role === 'gold'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500'
                    : plan.role === 'platinum'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                    : 'bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600'
                }`}
              >
                Get Started
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
