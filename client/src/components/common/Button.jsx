import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    type = 'button',
    className = '',
    disabled = false
}) => {
    const variantClass = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        outline: "btn-outline",
        ghost: "btn-ghost",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500" // kept ad-hoc for now or could add .btn-danger
    }[variant] || "btn-primary";

    return (
        <button
            type={type}
            className={`btn ${variantClass} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
