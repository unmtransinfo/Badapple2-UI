/*
@author Jack Ringer
Date: 10/9/2024
Description:
Pagination component used for results page. Splits up results
so as not to overwhelm the user with too many results at once.
*/
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalMolecules: number;
    moleculesPerPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalMolecules, moleculesPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalMolecules / moleculesPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex justify-center mt-4">
            <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            >
                Previous
            </button>
            <span className="px-4 py-2 mx-1">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;