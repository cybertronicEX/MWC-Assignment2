import React from 'react';
import Button from './Button';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-between items-center mt-4 px-2">
            <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm"
                >
                    Previous
                </Button>

                {/* Page Numbers */}
                <div className="hidden sm:flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm"
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
