/*
@author Jack Ringer
Date: 10/9/2024
Description:
Pagination component used for results page. Splits up results
so as not to overwhelm the user with too many results at once.
*/
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { getTextSizeStyle } from "../constants/Constants";
import { Button } from "./common";

interface PaginationProps {
  currentPage: number;
  totalMolecules: number;
  moleculesPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalMolecules,
  moleculesPerPage,
  onPageChange,
}) => {
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

  const textSize = "lg";

  return (
    <div className="flex justify-center mt-4">
      <Button
        onClick={handlePreviousPage}
        disabled={currentPage == 1}
        variant="arrow"
        icon={faArrowLeft}
        iconPosition="left"
        size={textSize}
      >
        Previous
      </Button>
      <span className={getTextSizeStyle(textSize)}>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        variant="arrow"
        icon={faArrowRight}
        iconPosition="right"
        size={textSize}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
