'use client';

import { useState, useEffect } from 'react';

interface RoleFilterBarProps {
  availableRoles: string[]; // Available roles to filter by
  selectedRole: string;
  selectedGender: string;
  minAge: string;
  maxAge: string;
  searchQuery: string;
  onRoleChange: (role: string) => void;
  onGenderChange: (gender: string) => void;
  onMinAgeChange: (age: string) => void;
  onMaxAgeChange: (age: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export default function RoleFilterBar({
  availableRoles,
  selectedRole,
  selectedGender,
  minAge,
  maxAge,
  searchQuery,
  onRoleChange,
  onGenderChange,
  onMinAgeChange,
  onMaxAgeChange,
  onSearchChange,
  onClearFilters,
}: RoleFilterBarProps) {
  const [sliderMin, setSliderMin] = useState(18);
  const [sliderMax, setSliderMax] = useState(50);

  useEffect(() => {
    if (minAge) {
      const parsed = parseInt(minAge);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 150) {
        setSliderMin(parsed);
      }
    } else if (minAge === '') {
      setSliderMin(18);
    }
  }, [minAge]);

  useEffect(() => {
    if (maxAge) {
      const parsed = parseInt(maxAge);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 150) {
        setSliderMax(parsed);
      }
    } else if (maxAge === '') {
      setSliderMax(50);
    }
  }, [maxAge]);

  const handleMinInputChange = (val: string) => {
    if (val === '') {
      onMinAgeChange('');
      return;
    }
    const numVal = parseInt(val);
    if (!isNaN(numVal) && numVal >= 0 && numVal <= 150) {
      if (numVal < sliderMax) {
        setSliderMin(numVal);
        onMinAgeChange(val);
      } else {
        const clampedValue = Math.max(0, sliderMax - 1);
        setSliderMin(clampedValue);
        onMinAgeChange(clampedValue.toString());
      }
    }
  };

  const handleMaxInputChange = (val: string) => {
    if (val === '') {
      onMaxAgeChange('');
      return;
    }
    const numVal = parseInt(val);
    if (!isNaN(numVal) && numVal >= 0 && numVal <= 150) {
      if (numVal > sliderMin) {
        setSliderMax(numVal);
        onMaxAgeChange(val);
      } else {
        const clampedValue = Math.min(150, sliderMin + 1);
        setSliderMax(clampedValue);
        onMaxAgeChange(clampedValue.toString());
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const hasActiveFilters = selectedRole !== 'all' || selectedGender !== 'all' || minAge !== '' || maxAge !== '' || searchQuery !== '';

  return (
    <div className='mb-8 w-full'>
      <div className='flex flex-col gap-4 p-6 rounded-xl border border-zinc-300 shadow-lg' style={{ backgroundColor: '#FFFFFF' }}>
        {/* Search Bar */}
        <div className='w-full'>
          <form onSubmit={handleSearch} className='relative w-full group'>
            <input
              type="text"
              placeholder="Search users by name, email, profession..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='w-full px-5 py-3 pl-12 pr-12 rounded-lg bg-white border transition-all duration-300 placeholder:text-[#9CA3AF]'
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
            />
            <svg
              className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300'
              style={{ color: '#9CA3AF' }}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              strokeWidth={2.5}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className='absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200'
              style={{ color: '#9CA3AF' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                aria-label="Clear search"
              >
                <svg fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            )}
          </form>
        </div>

        {/* Filters Row */}
        <div className='flex flex-wrap items-start gap-6'>
          {/* Role Filter */}
          <div className='flex flex-col gap-2 min-w-[150px] flex-1'>
            <label className='text-sm font-semibold flex items-center gap-2' style={{ color: '#374151' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className='px-4 py-3 rounded-lg border border-zinc-300 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 cursor-pointer hover:border-green-400'
            >
              <option value="all">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className='flex flex-col gap-2 min-w-[150px] flex-1'>
            <label className='text-sm font-semibold flex items-center gap-2' style={{ color: '#374151' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Gender
            </label>
            <select
              value={selectedGender}
              onChange={(e) => onGenderChange(e.target.value)}
              className='px-4 py-3 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer'
              style={{ borderColor: '#22C55E', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#16A34A'}
              onBlur={(e) => e.target.style.borderColor = '#22C55E'}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#16A34A'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#22C55E'}
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Age Range */}
          <div className='flex flex-col gap-2 flex-1 min-w-[280px]'>
            <label className='text-sm font-semibold flex items-center gap-2' style={{ color: '#374151' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#374151' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Age Range
            </label>
            <div className='flex items-center gap-3'>
              <input
                type="number"
                value={minAge || sliderMin}
                onChange={(e) => handleMinInputChange(e.target.value)}
                onBlur={(e) => {
                  e.target.style.borderColor = '#22C55E';
                  const val = e.target.value;
                  if (val === '') {
                    setSliderMin(18);
                    onMinAgeChange('18');
                  } else {
                    const numVal = parseInt(val);
                    if (!isNaN(numVal)) {
                      if (numVal >= sliderMax) {
                        const clampedValue = Math.max(0, sliderMax - 1);
                        setSliderMin(clampedValue);
                        onMinAgeChange(clampedValue.toString());
                      } else if (numVal < 0) {
                        setSliderMin(0);
                        onMinAgeChange('0');
                      } else {
                        setSliderMin(numVal);
                        onMinAgeChange(numVal.toString());
                      }
                    }
                  }
                }}
                min="0"
                max="150"
                className='w-24 px-4 py-3 rounded-xl border-2 bg-white text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-300'
                style={{ borderColor: '#22C55E', color: '#111827' }}
                onFocus={(e) => e.target.style.borderColor = '#16A34A'}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#16A34A'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#22C55E'}
              />
              <span className='font-semibold' style={{ color: '#374151' }}>-</span>
              <input
                type="number"
                value={maxAge || sliderMax}
                onChange={(e) => handleMaxInputChange(e.target.value)}
                onBlur={(e) => {
                  e.target.style.borderColor = '#22C55E';
                  const val = e.target.value;
                  if (val === '') {
                    setSliderMax(50);
                    onMaxAgeChange('50');
                  } else {
                    const numVal = parseInt(val);
                    if (!isNaN(numVal)) {
                      if (numVal <= sliderMin) {
                        const clampedValue = Math.min(150, sliderMin + 1);
                        setSliderMax(clampedValue);
                        onMaxAgeChange(clampedValue.toString());
                      } else if (numVal > 150) {
                        setSliderMax(150);
                        onMaxAgeChange('150');
                      } else {
                        setSliderMax(numVal);
                        onMaxAgeChange(numVal.toString());
                      }
                    }
                  }
                }}
                min="0"
                max="150"
                className='w-24 px-4 py-3 rounded-xl border-2 bg-white text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-300'
                style={{ borderColor: '#22C55E', color: '#111827' }}
                onFocus={(e) => e.target.style.borderColor = '#16A34A'}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#16A34A'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#22C55E'}
              />
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <div className='flex items-end'>
              <button
                type="button"
                onClick={onClearFilters}
                className='px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 flex items-center gap-2.5 shadow-md hover:shadow-lg'
                style={{ backgroundColor: '#16A34A' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803D'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
