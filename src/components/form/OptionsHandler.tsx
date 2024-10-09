/*
@author Jack Ringer
Date: 10/9/2024
Description:
Utility functions related to checking/handling selected input and output
options.
*/
import React from 'react';

const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>, updateUserOptions: (key: any, value: any) => void, optionKey: string, minVal: number, maxVal: number) => {
    const value = Number(e.target.value);
    if (value <= maxVal && value >= minVal) {
        updateUserOptions(optionKey, value);
    } 
    else if (value < minVal) {
        updateUserOptions(optionKey, minVal);
    }
    else {
        updateUserOptions(optionKey, maxVal);
    }
};

export default handleNumberInputChange;