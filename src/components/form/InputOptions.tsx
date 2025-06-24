import React from 'react';
import './tooltip.css';
import './optionsTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import handleNumberInputChange from './OptionsHandler';


export interface InputOptions {
    format: string;
    delimiter: string;
    smilesCol: number;
    nameCol: number;
    hasHeader: boolean;
}

export interface InputOptionsProps {
    inputOptions: InputOptions;
    updateInputOptions: (key: keyof InputOptions, value: any) => void;
}


const InputOptionsTable: React.FC<InputOptionsProps> = ({ inputOptions: inputOptions, updateInputOptions: updateInputOptions }) => {
    const { format, delimiter, smilesCol, nameCol, hasHeader } = inputOptions;

    return (
        <div id="user-options-container">
            <table className="table-bordered">
                <thead>
                    <tr>
                        <th>Input Spec</th>
                        <th>Select Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            Format
                            <span data-tooltip="Input format. 'SMILES' for inputs with delimiter-separated values (e.g., TSV). Currently only SMILES inputs are supported.">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <select name="molfmt" id="molFmt" value={format} onChange={(e) => updateInputOptions('format', e.target.value)}>
                                <option value="SMILES">SMILES</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Delimiter
                            <span data-tooltip="File delimiter">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <select name="delimiter" id="delimChoice" value={delimiter} onChange={(e) => updateInputOptions('delimiter', e.target.value)}>
                                <option value=" ">" " - space</option>
                                <option value=",">"," - comma</option>
                                <option value="\t">"\t" - tab</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            SMILES Col
                            <span data-tooltip="Column index of SMILES (indexing from 0)">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <input type="number" name="smiles_col" id="smiles_column" min={0} size={4} value={smilesCol} onChange={(e) => handleNumberInputChange(e, updateInputOptions, 'smilesCol', 0, 1e8)} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Name Col
                            <span data-tooltip="Column index of molecule names (indexing from 0)">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <input type="number" name="name_col" id="name_column" min={0} size={4} value={nameCol} onChange={(e) => handleNumberInputChange(e, updateInputOptions, 'nameCol', 0, 1e8)} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Header
                            <span data-tooltip="Indicates if header line present">
                                <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
                            </span>
                        </td>
                        <td>
                            <input type="checkbox" name="has_header" id="header_checkbox" checked={hasHeader} onChange={(e) => updateInputOptions('hasHeader', e.target.checked)} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default InputOptionsTable;