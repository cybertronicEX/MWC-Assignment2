import React from 'react';

const Loading = ({ fullScreen = false, size = 'medium', color = 'primary', className = '' }) => {
    // Size classes
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-8 h-8 border-[3px]',
        large: 'w-12 h-12 border-4'
    };

    // Color classes (Tailwind border colors)
    const colorClasses = {
        primary: 'border-primary',
        white: 'border-white',
        slate: 'border-slate-400'
    };

    const spinner = (
        <div className={`
            animate-spin rounded-full 
            border-t-transparent 
            ${sizeClasses[size] || sizeClasses.medium} 
            ${colorClasses[color] || colorClasses.primary}
            ${className}
        `}></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300">
                <div className="flex flex-col items-center gap-4">
                    {spinner}
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return spinner;
};

export default Loading;
