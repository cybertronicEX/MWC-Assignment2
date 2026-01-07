import React from 'react';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    className = ''
}) => {
    return (
        <div className={`flex flex-col mb-5 ${className}`}>
            {label && (
                <label className="input-label">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`input-field ${error ? 'input-error' : ''}`}
            />
            {error && <span className="mt-1.5 text-xs text-red-500 font-medium">{error}</span>}
        </div>
    );
};

export default Input;
