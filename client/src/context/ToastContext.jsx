import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-in slide-in-from-right-full duration-300
                            ${toast.type === 'success' ? 'bg-emerald-500' :
                                toast.type === 'error' ? 'bg-red-500' :
                                    toast.type === 'warning' ? 'bg-amber-500' : 'bg-slate-700'}
                        `}
                    >
                        {toast.type === 'success' && <span>✓</span>}
                        {toast.type === 'error' && <span>✕</span>}
                        {toast.type === 'warning' && <span>!</span>}
                        {toast.message}
                        <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-70 hover:opacity-100">×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
