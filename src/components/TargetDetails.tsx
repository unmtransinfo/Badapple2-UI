/*
@author Jack Ringer
Date: 12/5/2024
Description:
Component which displays table with details on active biological targets
for a given scaffold.
*/
import React from 'react';
import { fetchActiveTargetDetails } from '../api';

interface TargetRow {
    aid: number, // PubChem AssayID
    external_id: string,
    external_id_type: string,
    name: string,
    protein_family: string,
    target_id: number, // ID internal to badapple2+ DB
    taxonomy: string,
    taxonomy_id: number, // NCBI taxonomy ID
    type: string, // target type (Protein, Gene, etc)
}

interface TargetDetailsProps {
    scaffoldID: number;
}

const TargetDetails: React.FC<TargetDetailsProps> = ({ scaffoldID }) => {
    const [targetRows, setTargetRows] = React.useState<TargetRow[]>([]);

    React.useEffect(() => {
        const getTargetDetails = async () => {
            const data = await fetchActiveTargetDetails(scaffoldID);
            setTargetRows(data);
        };
        getTargetDetails();
    }, [scaffoldID]);

    const tableHeaders = ["AID", "TargetType", "ID", "ID-TYPE", "Name", "Taxonomy", "TaxonomyID", "ProteinFamily"];
    const rowKeys: (keyof TargetRow)[] = ["aid", "type", "external_id", "external_id_type", "name", "taxonomy", "taxonomy_id", "protein_family"];

    return (
        <div>
            <p>The table below provides the specific assay records where scaffold with id={scaffoldID} was found to be present in an active substance, along with corresponding biological target(s).
            For each target the following information is provided:</p>
            <ul>
                <li><b>AID:</b> The <a href="https://pubchem.ncbi.nlm.nih.gov/"target="_blank" rel="noopener noreferrer">PubChem</a> AssayID (AID) the given scaffold was found to be active in.</li>
                <li><b>TargetType:</b> Target type (most commonly "Protein", but can also include "Gene", "Nucleotide", and "Pathway").</li>
                <li><b>ID:</b> Target ID. Clickable if ID-TYPE is either "UniProt" or "NCBI".</li>
                <li><b>ID-TYPE:</b> Resource ID is linked to (one of "UniProt", "NCBI", or "Other")</li>
                <li><b>Name:</b> Name of the target</li>
                <li><b>Taxonomy:</b> Target taxon from the <a href="https://www.ncbi.nlm.nih.gov/taxonomy" target="_blank" rel="noopener noreferrer"> NCBI Taxonomy Database</a></li>
                <li><b>TaxonomyID:</b> Taxon ID from the NCBI Taxonomy Database. If clicked on will redirect to the taxon page on NCBI website.</li>
                <li><b>ProteinFamily:</b> Protein family information from <a href="https://pharos.nih.gov/" target="_blank" rel="noopener noreferrer">Pharos</a>, if available.</li>
            </ul>
            <p> Note that some PubChem assay records do not provide explicit target information. 
                For these cases target information is not provided here, but one can visit the linked assay page to learn more.</p>
            <table border={1}>
                <thead>
                    <tr>
                        {tableHeaders.map(header => <th key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {targetRows.map((row, index) => (
                        <tr key={index}>
                            {rowKeys.map(key => (
                                <td key={key}>
                                {key === "aid" ? (
                                    <a href={`https://pubchem.ncbi.nlm.nih.gov/bioassay/${row[key]}`} target="_blank" rel="noopener noreferrer">
                                        {row[key]}
                                    </a>
                                ) : key === "external_id" && row["external_id_type"] === "UniProt" ? (
                                    <a href={`https://www.uniprot.org/uniprotkb/${row[key]}/entry`} target="_blank" rel="noopener noreferrer">
                                        {row[key]}
                                    </a>
                                ) : key === "external_id" && row["external_id_type"] === "NCBI" ? (
                                    <a href={`https://www.ncbi.nlm.nih.gov/${row["type"].toLowerCase()}/${row[key]}`} target="_blank" rel="noopener noreferrer">
                                        {row[key]}
                                    </a>
                                ): key === "taxonomy_id" ? (
                                    <a href={`https://www.ncbi.nlm.nih.gov/taxonomy/${row[key]}`} target="_blank" rel="noopener noreferrer">
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

export default TargetDetails;