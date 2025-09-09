/*
@author Jack Ringer
Date: 12/5/2024
Description:
Component which displays the pop-up window with inDrug details for a given scaffold.
*/
import React, { ReactNode } from "react";
import { fetchDrugDetails } from "../api";
import { generateTSV } from "../utils/downloadTSV";
import { Button } from "./common";

interface DrugRow {
  drug_id: string;
  inn: string;
}

interface DrugDetailsProps {
  scaffoldID: number;
  scaffoldImage: ReactNode;
}

const DrugDetails: React.FC<DrugDetailsProps> = ({
  scaffoldID,
  scaffoldImage,
}) => {
  const [rows, setRows] = React.useState<DrugRow[]>([]);

  React.useEffect(() => {
    const getDrugDetails = async () => {
      const data = await fetchDrugDetails(scaffoldID);
      setRows(data);
    };
    getDrugDetails();
  }, [scaffoldID]);

  const tableHeaders = ["DrugCentralID", "INN"];
  const rowKeys: (keyof DrugRow)[] = ["drug_id", "inn"];

  const handleDownloadTSV = () => {
    generateTSV(
      `scaffold_${scaffoldID}_approved_drugs.tsv`,
      tableHeaders,
      rowKeys,
      rows
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2>Drug Details for Scaffold</h2>
        <h3>ScaffoldID={scaffoldID}</h3>
        {scaffoldImage}
      </div>
      <p>
        The table below provides the specific drugs scaffold with id=
        {scaffoldID} was found in. For each drug the following information is
        provided:
      </p>
      <ul>
        <li>
          <b>DrugCentralID:</b> ID from{" "}
          <a
            href="https://drugcentral.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            DrugCentral
          </a>
          . Clicking on the ID will take you to the DrugCentral page for the
          drug.
        </li>
        <li>
          <b>INN:</b> International Nonproprietary Name
        </li>
      </ul>
      <Button
        variant="success"
        disabled={rows.length === 0}
        onClick={() => handleDownloadTSV()}
      >
        Download TSV
      </Button>
      <table border={1}>
        <thead>
          <tr>
            {tableHeaders.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {rowKeys.map((key) => (
                <td key={key}>
                  {key === "drug_id" ? (
                    <a
                      href={`https://drugcentral.org/drugcard/${row[key]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row[key]}
                    </a>
                  ) : (
                    row[key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DrugDetails;
