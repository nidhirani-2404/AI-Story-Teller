import React from 'react';

export default function InputField({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  rows = 3,
  description
}) {
  const inputClass = "w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:bg-slate-900";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-200">
          {label} {required && <span className="text-purple-400">*</span>}
        </label>
      </div>
      
      {description && (
        <span className="text-xs text-slate-400 mb-1">{description}</span>
      )}

      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={inputClass}
        />
      )}
    </div>
  );
}
