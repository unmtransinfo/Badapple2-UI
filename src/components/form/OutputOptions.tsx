import React from 'react';
import './tooltip.css';
import './optionsTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import handleNumberInputChange from './OptionsHandler';

export interface OutputOptions {
    maxMolecules: number,
    startIdx: number
}

export interface OutputOptionsProps {
    outputOptions: OutputOptions;
    updateOutputOptions: (key: keyof OutputOptions, value: any) => void;
}

const OutputOptionsTable: React.FC<OutputOptionsProps> = ({ outputOptions: outputOptions, updateOutputOptions: updateOutputOptions }) => {
    const { maxMolecules, startIdx} = outputOptions;


    return (
        <div id="user-options-container">
            <table className="table-bordered">
                <thead>
                    <tr>
                        <th>Output Spec</th>
                        <th>Select Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            Start Index
                            <span data-tooltip="Index of first molecule to process (indexing from 0)">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <input type="number" name="startIdx" id="startIdx" min={0} max={1e8} size={4} value={startIdx} onChange={(e) => handleNumberInputChange(e, updateOutputOptions, 'startIdx', 0, 1e8)} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            N. Molecules
                            <span data-tooltip="Number of molecules to process, beginning from given start index. Max is 100.">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <input type="number" name="maxMolecules" id="maxMolecules" min={1} size={4} max={100} value={maxMolecules} onChange={(e) => handleNumberInputChange(e, updateOutputOptions, 'maxMolecules', 1, 100)} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default OutputOptionsTable;



