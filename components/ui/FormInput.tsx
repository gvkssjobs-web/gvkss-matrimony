import React from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  className?: string;
  options?: { value: string; label: string }[];
  select?: boolean;
  textarea?: boolean;
  rows?: number;
  helperText?: string;
}

export default function FormInput({
  label,
  type = 'text',
  id,
  value,
  onChange,
  required = false,
  minLength,
  placeholder,
  className = '',
  options,
  select = false,
  textarea = false,
  rows = 4,
  helperText,
}: FormInputProps) {
  const baseInputClass = 'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors placeholder:text-[#9CA3AF]';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
        {label}
      </label>
      {select && options ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`${baseInputClass} ${className}`}
          required={required}
          style={{ borderColor: '#FF8AA2', color: '#111827' }}
          onFocus={(e) => e.target.style.borderColor = '#E94B6A'}
          onBlur={(e) => e.target.style.borderColor = '#FF8AA2'}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          rows={rows}
          className={`${baseInputClass} ${className}`}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          className={`${baseInputClass} ${className}`}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          style={{ borderColor: '#FF8AA2', color: '#111827' }}
          onFocus={(e) => e.target.style.borderColor = '#E94B6A'}
          onBlur={(e) => e.target.style.borderColor = '#FF8AA2'}
        />
      )}
      {helperText && (
        <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>{helperText}</p>
      )}
    </div>
  );
}
