import React from 'react';

const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: "bg-slate-100 text-slate-700",
        success: "bg-emerald-100 text-emerald-700",
        warning: "bg-amber-100 text-amber-700",
        error: "bg-rose-100 text-rose-700",
        info: "bg-sky-100 text-sky-700",
        primary: "bg-primary/10 text-primary-dark"
    };

    return (
        <span className={`badge ${variants[variant]}`}>
            {children}
        </span>
    );
};

export default Badge;
