import React from "react";
import { NumberInput } from "../common";
import handleNumberInputChange from "./OptionsHandler";
import "./OptionsTable.css";
import ToolTip from "./ToolTip";

export interface InputOptions {
  format: string;
  delimiter: string;
  smilesCol: number;
  nameCol: number;
  hasHeader: boolean;
}
// TODO: figure out why number input shows up weird on Chromium browsers here
export interface InputOptionsProps {
  inputOptions: InputOptions;
  updateInputOptions: (key: keyof InputOptions, value: any) => void;
}

const InputOptionsTable: React.FC<InputOptionsProps> = ({
  inputOptions: inputOptions,
  updateInputOptions: updateInputOptions,
}) => {
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
              <ToolTip
                name="Format"
                text="Input format. 'SMILES' for inputs with delimiter-separated values (e.g., TSV). Currently only SMILES inputs are supported."
              />
            </td>
            <td>
              <select
                name="molfmt"
                id="molFmt"
                value={format}
                onChange={(e) => updateInputOptions("format", e.target.value)}
              >
                <option value="SMILES">SMILES</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <ToolTip name="Delimiter" text="File delimiter" />
            </td>
            <td>
              <select
                name="delimiter"
                id="delimChoice"
                value={delimiter}
                onChange={(e) =>
                  updateInputOptions("delimiter", e.target.value)
                }
              >
                <option value=" ">" " - space</option>
                <option value=",">"," - comma</option>
                <option value="\t">"\t" - tab</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <ToolTip
                name="SMILES Col"
                text="Column index of SMILES (indexing from 0)"
              />
            </td>
            <td>
              <NumberInput
                name="smiles_col"
                id="smiles_column"
                min={0}
                max={1e8}
                value={smilesCol}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNumberInputChange(
                    e,
                    updateInputOptions,
                    "smilesCol",
                    0,
                    1e8
                  )
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              <ToolTip
                name="Name Col"
                text="Column index of molecule names (indexing from 0)"
              />
            </td>
            <td>
              <NumberInput
                name="name_col"
                id="name_column"
                min={0}
                max={1e8}
                value={nameCol}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNumberInputChange(
                    e,
                    updateInputOptions,
                    "nameCol",
                    0,
                    1e8
                  )
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              <ToolTip name="Header" text="Indicates if header line present" />
            </td>
            <td>
              <input
                type="checkbox"
                name="has_header"
                id="header_checkbox"
                checked={hasHeader}
                onChange={(e) =>
                  updateInputOptions("hasHeader", e.target.checked)
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InputOptionsTable;
