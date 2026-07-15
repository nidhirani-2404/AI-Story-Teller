import React from 'react';

export default function SelectField({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  required = false,
  description
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-semibold text-slate-200">
        {label} {required && <span className="text-purple-400">*</span>}
      </label>

      {description && (
        <span className="text-xs text-slate-400 mb-1">{description}</span>
      )}

      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all duration-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:bg-slate-900 cursor-pointer"
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-slate-950 text-slate-200 py-2"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
