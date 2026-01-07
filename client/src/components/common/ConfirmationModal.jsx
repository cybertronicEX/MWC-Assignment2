import React from 'react';
import Card from './Card';
import Button from './Button';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary' // primary, danger, warning
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-sm relative shadow-2xl">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-600 mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'primary' : 'primary'} // Map danger to primary but maybe color it red via custom class if Button supports it, staying simple for now
                        className={variant === 'danger' ? '!bg-red-600 hover:!bg-red-700' : ''}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ConfirmationModal;
