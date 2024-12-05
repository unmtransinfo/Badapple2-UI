/*
@author Jack Ringer
Date: 12/5/2024
Description:
Component which displays the pop-up window with inDrug details for a given scaffold.
*/
import React from 'react';
import { fetchDrugDetails } from '../api';

interface DrugRow {
    drug_id: string;
    inn: string;
}

interface DrugDetailsProps {
    scaffoldID: number;
}

const DrugDetails: React.FC<DrugDetailsProps> = ({ scaffoldID }) => {
    const [drugRows, setDrugRows] = React.useState<DrugRow[]>([]);

    React.useEffect(() => {
        const getDrugDetails = async () => {
            const data = await fetchDrugDetails(scaffoldID);
            setDrugRows(data);
        };
        getDrugDetails();
    }, [scaffoldID]);

    const tableHeaders = ["DrugCentralID", "INN"];
    const rowKeys: (keyof DrugRow)[] = ["drug_id", "inn"];

    return (
        <div>
            <p>The table below provides the specific drugs scaffold with id={scaffoldID} was found in. 
            For each drug, the DrugCentralID and the International Nonproprietary Name (INN) are provided. 
            Clicking on the DrugCentralID will take you to the DrugCentral page for the drug.</p>
            <table border={1}>
                <thead>
                    <tr>
                        {tableHeaders.map(header => <th key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {drugRows.map((row, index) => (
                        <tr key={index}>
                            {rowKeys.map(key => (
                                <td key={key}>
                                    {key === "drug_id" ? (
                                        <a href={`https://drugcentral.org/drugcard/${row[key]}`} target="_blank" rel="noopener noreferrer">
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