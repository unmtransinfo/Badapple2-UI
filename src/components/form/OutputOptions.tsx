import React from "react";
import handleNumberInputChange from "./OptionsHandler";
import "./optionsTable.css";
import ToolTip from "./ToolTip";

export interface OutputOptions {
  maxMolecules: number;
  startIdx: number;
  maxRings: number;
  database: string;
}

export interface OutputOptionsProps {
  outputOptions: OutputOptions;
  updateOutputOptions: (key: keyof OutputOptions, value: any) => void;
}

const OutputOptionsTable: React.FC<OutputOptionsProps> = ({
  outputOptions: outputOptions,
  updateOutputOptions: updateOutputOptions,
}) => {
  const { maxMolecules, startIdx, maxRings, database } = outputOptions;
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
              <ToolTip
                name="Database"
                text="Database to fetch information from"
              />
            </td>
            <td>
              <select
                name="database"
                id="databaseChoice"
                value={database}
                onChange={(e) =>
                  updateOutputOptions("database", e.target.value)
                }
              >
                <option value={import.meta.env.VITE_DB_NAME}>
                  badapple_classic
                </option>
                <option value={import.meta.env.VITE_DB2_NAME}>badapple2</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <ToolTip
                name="Start Index"
                text="Index of first molecule to process (indexing from 0)"
              />
            </td>
            <td>
              <input
                type="number"
                name="startIdx"
                id="startIdx"
                min={0}
                max={1e8}
                size={4}
                value={startIdx}
                onChange={(e) =>
                  handleNumberInputChange(
                    e,
                    updateOutputOptions,
                    "startIdx",
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
                name="N. Molecules"
                text="Number of molecules to process, beginning from given start index. Max is 100. Note also that there is a limit on the number of input characters."
              />
            </td>
            <td>
              <input
                type="number"
                name="maxMolecules"
                id="maxMolecules"
                min={1}
                size={4}
                max={100}
                value={maxMolecules}
                onChange={(e) =>
                  handleNumberInputChange(
                    e,
                    updateOutputOptions,
                    "maxMolecules",
                    1,
                    100
                  )
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              <ToolTip
                name="Max Rings"
                text="Maximum number of ring systems in input molecules. Molecules which exceed this limit will not be processed. Max is 10."
              />
            </td>
            <td>
              <input
                type="number"
                name="maxRings"
                id="maxRings"
                min={1}
                size={4}
                max={10}
                value={maxRings}
                onChange={(e) =>
                  handleNumberInputChange(
                    e,
                    updateOutputOptions,
                    "maxRings",
                    1,
                    10
                  )
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OutputOptionsTable;
