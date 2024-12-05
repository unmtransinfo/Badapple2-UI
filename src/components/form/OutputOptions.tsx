import React from 'react';
import './tooltip.css';
import './optionsTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import handleNumberInputChange from './OptionsHandler';

export interface OutputOptions {
    maxMolecules: number,
    startIdx: number,
    maxRings: number,
    database: string
}

export interface OutputOptionsProps {
    outputOptions: OutputOptions;
    updateOutputOptions: (key: keyof OutputOptions, value: any) => void;
}

const OutputOptionsTable: React.FC<OutputOptionsProps> = ({ outputOptions: outputOptions, updateOutputOptions: updateOutputOptions }) => {
    const { maxMolecules, startIdx, maxRings, database} = outputOptions;

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
                            Database
                            <span data-tooltip="Database to fetch information from">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <select name="database" id="databaseChoice" value={database} onChange={(e) => updateOutputOptions('database', e.target.value)}>
                                <option value={import.meta.env.BADAPPLE_CLASSIC} id="databaseChoiceDefault">badapple_classic</option>
                                <option value={import.meta.env.BADAPPLE2}>badapple2</option>
                            </select>
                        </td>
                    </tr>
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
                    <tr>
                        <td>
                            Max Rings
                            <span data-tooltip="Maximum number of ring systems in input molecules. Molecules which exceed this limit will not be processed. Max is 10.">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <input type="number" name="maxRings" id="maxRings" min={1} size={4} max={10} value={maxRings} onChange={(e) => handleNumberInputChange(e, updateOutputOptions, 'maxRings', 1, 10)} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default OutputOptionsTable;



