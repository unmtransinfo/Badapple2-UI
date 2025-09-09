/*
@author Jack Ringer
Date: 9/9/2025
Description:
Component which displays table with details on active assays + targets
for a given scaffold.
*/
import React, { ReactNode } from "react";
import { fetchActiveAssayDetails } from "../api";
import { generateTSV } from "../utils/downloadTSV";
import { Button } from "./common";

interface AssayRow {
  aid: number; // PubChem AssayID
  assay_format: string; // BARD assay format
  assay_type: string; // BARD assay type
  detection_method: string; // BARD detection method
  external_id: string;
  external_id_type: string;
  name: string;
  protein_family: string;
  target_id: number; // ID internal to badapple2+ DB
  taxonomy: string;
  taxonomy_id: number; // NCBI taxonomy ID
  type: string; // target type (Protein, Gene, etc)
}

interface AssayDetailsProps {
  scaffoldID: number;
  scaffoldImage: ReactNode;
}

interface SmallNoteProps {
  text: string;
}

const SmallNote: React.FC<SmallNoteProps> = ({ text }) => {
  return (
    <p>
      <small>{text}</small>
    </p>
  );
};

const ActiveAssayDetails: React.FC<AssayDetailsProps> = ({
  scaffoldID,
  scaffoldImage,
}) => {
  const [rows, setRows] = React.useState<AssayRow[]>([]);

  React.useEffect(() => {
    const getAssayDetails = async () => {
      const data = await fetchActiveAssayDetails(scaffoldID);
      setRows(data);
    };
    getAssayDetails();
  }, [scaffoldID]);

  const tableHeaders = [
    "AID",
    "AssayFormat",
    "AssayType",
    "DetectionMethod",
    "TargetType",
    "ID",
    "ID-TYPE",
    "Name",
    "Taxonomy",
    "TaxonomyID",
    "ProteinFamily",
  ];
  const rowKeys: (keyof AssayRow)[] = [
    "aid",
    "assay_format",
    "assay_type",
    "detection_method",
    "type",
    "external_id",
    "external_id_type",
    "name",
    "taxonomy",
    "taxonomy_id",
    "protein_family",
  ];

  const handleDownloadTSV = () => {
    generateTSV(
      `scaffold_${scaffoldID}_active_assays.tsv`,
      tableHeaders,
      rowKeys,
      rows
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2>Assay+Target Details for Scaffold</h2>
        <h3>ScaffoldID={scaffoldID}</h3>
        {scaffoldImage}
      </div>
      <p>
        The table below provides the specific assay records where scaffold with
        id={scaffoldID} was present in one or more active substances, along with
        corresponding biological target(s) and annotations from the{" "}
        <a
          href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4383997/"
          target="_blank"
          rel="noopener noreferrer"
        >
          BioAssay Research Database (BARD)
        </a>{" "}
        . The columns of the table are as follows:
      </p>
      <ul>
        <li>
          <b>AID:</b> The{" "}
          <a
            href="https://pubchem.ncbi.nlm.nih.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            PubChem
          </a>{" "}
          AssayID (AID) the given scaffold was found to be active in.
        </li>
        <li>
          <b>AssayFormat:</b> BARD assay format.
        </li>
        <li>
          <b>AssayType:</b> BARD assay type.
        </li>
        <li>
          <b>DetectionMethod:</b> BARD assay detection method.
        </li>
        <li>
          <b>TargetType:</b> Target type (most commonly "Protein", but can also
          include "Gene", "Nucleotide", and "Pathway").
        </li>
        <li>
          <b>ID:</b> Target ID. Clickable if ID-TYPE is either "UniProt" or
          "NCBI".
        </li>
        <li>
          <b>ID-TYPE:</b> Resource ID is linked to (one of "UniProt", "NCBI", or
          "Other")
        </li>
        <li>
          <b>Name:</b> Name of the target
        </li>
        <li>
          <b>Taxonomy:</b> Target taxon from the{" "}
          <a
            href="https://www.ncbi.nlm.nih.gov/taxonomy"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            NCBI Taxonomy Database
          </a>
        </li>
        <li>
          <b>TaxonomyID:</b> Taxon ID from the NCBI Taxonomy Database. If
          clicked on will redirect to the taxon page on NCBI website.
        </li>
        <li>
          <b>ProteinFamily:</b> Protein family information from{" "}
          <a
            href="https://pharos.nih.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pharos
          </a>
          , if available.
        </li>
      </ul>
      <SmallNote
        text={
          "Note that not all PubChem assay records provide BARD annotations or explicit target information. One can visit the linked assay page to learn more."
        }
      />
      <SmallNote
        text={
          "Note that when determining pScores and related statistics (such as aActive) only data from compounds tested in 50 or more unique assays is considered. In contrast, the information shown on this page considers all compounds/substances in the database. For this reason more assays may be shown in the table below than were counted by aActive. Please see the about page for more information."
        }
      />
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
                  {key === "aid" ? (
                    <a
                      href={`https://pubchem.ncbi.nlm.nih.gov/bioassay/${row[key]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row[key]}
                    </a>
                  ) : key === "external_id" &&
                    row["external_id_type"] === "UniProt" ? (
                    <a
                      href={`https://www.uniprot.org/uniprotkb/${row[key]}/entry`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row[key]}
                    </a>
                  ) : key === "external_id" &&
                    row["external_id_type"] === "NCBI" ? (
                    <a
                      href={`https://www.ncbi.nlm.nih.gov/${row[
                        "type"
                      ].toLowerCase()}/${row[key]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row[key]}
                    </a>
                  ) : key === "taxonomy_id" ? (
                    <a
                      href={`https://www.ncbi.nlm.nih.gov/taxonomy/${row[key]}`}
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

export default ActiveAssayDetails;
