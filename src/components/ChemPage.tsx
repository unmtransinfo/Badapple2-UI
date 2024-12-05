import React, {Dispatch, SetStateAction, ReactNode, useState, useRef} from "react";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import MoleculeStructure from "./MoleculeStructure.tsx";
import Pagination from "./Pagination.tsx";
import {fetchDrugDetails} from '../api.ts';

// define interfaces
interface ScaffoldInfo {
    scafsmi: string;
    id: number;
    pscore: number;
    in_db: boolean;
    in_drug: boolean;
    nsub_tested: number,
    nsub_active: number,
    nass_tested: number,
    nass_active: number,
    nsam_tested: number,
    nsam_active: number
}

// each input SMILES will return a dict with the following:
export interface MoleculeInfo {
    molecule_smiles: string;
    name: string;
    scaffolds: ScaffoldInfo[];
    error_msg: string,
};

interface ChemPageProps {
    result:  MoleculeInfo[];
    canGetDrugInfo: boolean;
    setChem: Dispatch<SetStateAction<any>>;
}

const COLUMN_HEADER_TEXT = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200";
const MOL_COL_TEXT = "whitespace-nowrap text-s font-medium text-gray-900";
const SVG_WIDTH = 200;
const SVG_HEIGHT = 125;
const TABLE_N_COLUMNS = 8;

const getRowEntryClass = (entryColor: string, boldText: boolean) => {
    return `px-6 py-4 whitespace-nowrap text-s ${boldText ? 'font-medium' : ''} text-gray-900 border-r border-gray-200 ${entryColor}`;
}

const transformSmiles = (smiles: string) => {
    /*
    This function is used to transform scaffold SMILES because RDKit.js uses get_qmol() to perform substructure-highlighting,
    and get_qmol() expects SMARTS patterns. See: https://github.com/rdkit/rdkit/issues/5688 for more info.
    Without this function some molecule/scaffold pairs would not properly highlight, e.g.:
    molecule="CN1C(=O)N(C)C(=O)C(N(C)C=N2)=C12" # caffeine
    scaffold="O=c1[nH]c(=O)c2[nH]cnc2[nH]1"
    */
    const atomMap = {
        'b' : 5, // boron
        'c': 6,  // carbon
        'n': 7,  // nitrogen
        'o': 8,  // oxygen
        'p': 15,  // phosphorus
        's': 16, // sulfur
        'br': 35 // bromine
    };

    return smiles.replace(/\[([nocspe])H\]/gi, (match, atom: keyof typeof atomMap) => {
        const lowerAtom = atom.toLowerCase() as keyof typeof atomMap;
        return `[#${atomMap[lowerAtom] || atom}]`;
    });
};



// for visualizing score advisory color
const getRowEntryColor = (pscore: number) => {
    if (pscore === null || pscore === undefined || pscore < 0) return "bg-gray-300";
    if (pscore >= 300) return "bg-red-300";
    if (pscore >= 100) return "bg-yellow-300";
    return "bg-green-300";
};


const buildDetailsArray = (scaffold: ScaffoldInfo): string[] => {
    const {
        nsub_tested,
        nsub_active,
        nass_tested,
        nass_active,
        nsam_tested,
        nsam_active
    } = scaffold;

    return [
        `substances tested: ${nsub_tested}`,
        `substances active: ${nsub_active}`,
        `assays tested: ${nass_tested}`,
        `assays active: ${nass_active}`,
        `samples tested: ${nsam_tested}`,
        `samples active: ${nsam_active}`
    ];
};


const truncateName = (name: string, maxLength: number) => {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
};





const displayDrugDetails = async(scaffoldID: number) => {
    const drugRows = await fetchDrugDetails(scaffoldID);
    const rowKeys: (keyof DrugRow)[] = ["drug_id", "inn"]; // excluding "cansmi" for now - probably not of interest
    const tableHeaders = ["DrugCentralID", "INN"];
    let tableHTML = `
        <p>The table below provides the specific drugs scaffold with  id=${scaffoldID} was found in. 
        For each drug, the DrugCentralID and the 
        International Nonproprietary Name (INN) are provided. Clicking on the DrugCentralID will take you to the DrugCentral page for the drug.</p>
        <table border='1'><tr>`;

    // Add table headers
    tableHeaders.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += "</tr>";

    // Add table rows
    interface DrugRow {
        drug_id: string;
        inn: string;
        cansmi: string;
    }

    drugRows.forEach((row: DrugRow) => {
        tableHTML += "<tr>";
        rowKeys.forEach((rowKey: keyof DrugRow) => {
            if (rowKey !== "drug_id") {
                tableHTML += `<td>${row[rowKey]}</td>`;
            } else {
                const drugcentralID = row[rowKey];
                const drugCentralLink = `https://drugcentral.org/drugcard/${drugcentralID}`;
                tableHTML += `<td><a href="${drugCentralLink}" target="_blank">${drugcentralID}</a></td>`;
            }
        });
        tableHTML += "</tr>";
    });
    tableHTML += "</table>";

    // Open a new window and write the table HTML to it
    const popupWindow = window.open("", "DrugRowsPopup", "width=600,height=400");
    if (popupWindow) {
        popupWindow.document.write("<html><head><title>Drug Rows</title></head><body>");
        popupWindow.document.write(tableHTML);
        popupWindow.document.write("</body></html>");
        popupWindow.document.close();
    } else {
        console.error("Failed to open popup window");
    }
}

const renderTableRow = (
    index: number,
    scaffoldIndex: number,
    molData: any,
    scaffold: ScaffoldInfo | null,
    highestPscoreColor: string,
    nRows: number,
    canGetDrugInfo: boolean
) => {
    const { scafsmi = "", pscore = null, in_db = null, in_drug = null } = scaffold || {};
    const inDrugString = !in_db ? "NULL" : (in_drug ? "True" : "False");
    const pscoreString = !in_db ? "NULL" : String(pscore);
    const detailsArray = scaffold ? buildDetailsArray(scaffold) : [];
    const rowColor = pscore ? getRowEntryColor(pscore) : getRowEntryColor(-1);
    const isFirstOccurrence = (scaffoldIndex == 0);
    const first2ColClass = getRowEntryClass(highestPscoreColor, true);
    const otherColClass = getRowEntryClass(rowColor, false);

    return (
        <tr key={`${index}-${scaffoldIndex}`} className={rowColor}>
            {isFirstOccurrence ? (
                <td id="table-results" className={first2ColClass} rowSpan={nRows}>
                {truncateName(molData.name, 16)}
                </td>
            ) : <></>}
            <td id="table-results" className={first2ColClass}>
                <MoleculeStructure
                    id={`mol-smile-svg-${index}-${scaffoldIndex}`}
                    structure={molData.molecule_smiles}
                    subStructure={transformSmiles(scafsmi)}
                    width={SVG_WIDTH}
                    height={SVG_HEIGHT}
                    svgMode={true}
                    className="mb-0"
                />
            </td>
            {scafsmi ? (
                <td id="table-results" className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <MoleculeStructure
                        id={`scaf-smile-svg-${index}-${scaffoldIndex}`}
                        structure={scafsmi}
                        width={SVG_WIDTH}
                        height={SVG_HEIGHT}
                        svgMode={true}
                        className="mb-0"
                    />
                </td>
            ) : (
                <td id="table-results" className={otherColClass}>Has no scaffolds <br></br>or &gt;maxRings</td>
            )}
            <td className={otherColClass}>
                {scaffold && in_drug && canGetDrugInfo ? (
                    <a href="#" onClick={(event) => {
                        event.preventDefault();
                        displayDrugDetails(scaffold.id);
                    }} className="clickable-link">
                        {inDrugString}
                    </a>
                ) : (
                    inDrugString
                )}
            </td>
            <td id="table-results" className={otherColClass}>{pscoreString ? pscoreString : ""}</td>
            {detailsArray && detailsArray.length === 6 ? (
                <>
                    <td id="table-results-1" className={otherColClass}>
                        <div>{detailsArray[0]}</div>
                        <div>{detailsArray[1]}</div>
                    </td>
                    <td id="table-results-2" className={otherColClass}>
                        <div>{detailsArray[2]}</div>
                        <div>{detailsArray[3]}</div>
                    </td>
                    <td id="table-results-3" className={otherColClass}>
                        <div>{detailsArray[4]}</div>
                        <div>{detailsArray[5]}</div>
                    </td>
                </>
            ) : (
                <>
                    <td id="table-results" className={otherColClass}></td>
                    <td id="table-results" className={otherColClass}></td>
                    <td id="table-results" className={otherColClass}></td>
                </>
            )}
        </tr>
    );
};

const getSeparator = () => { 
    // separator shown between scaffolds for different molecules
    return (
        <tr>
            <td colSpan={TABLE_N_COLUMNS} className="py-2">
                <hr className="border-t-2 border-gray-300" />
            </td>
        </tr>)
}


const getRow = (molData: MoleculeInfo, scaffold: ScaffoldInfo, index: number, scaffoldIndex: number, highestPscoreRowClassName: string, molTotalRows: number, canGetDrugInfo: boolean): ReactNode => {
    
    return (
        renderTableRow(index, scaffoldIndex, molData, scaffold, highestPscoreRowClassName, molTotalRows, canGetDrugInfo)
    );
}

const getMoleculeRows = (moleculeInfos: MoleculeInfo[], canGetDrugInfo: boolean) : React.ReactNode => {
    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {moleculeInfos.map((molData, index) => {
                const molName = truncateName(molData.name, 16);
                const molSmilesStr = truncateName(molData.molecule_smiles, 16);
                const validMol = (molData.scaffolds !== undefined && molData.scaffolds !== null);
                if (validMol && molData.scaffolds.length > 0) {
                    // Sort the scaffolds array by pscore in descending order
                    const scaffoldInfos = molData.scaffolds;
                    const sortedScaffolds = scaffoldInfos.sort((a, b) => {
                        if (b.pscore === undefined || b.pscore === null) return -1;
                        if (a.pscore === undefined || a.pscore === null) return 1;
                        return b.pscore - a.pscore;
                    });

                    // Get the highest pscore and its corresponding row class name (for molecule column color)
                    const highestPscore = sortedScaffolds.length > 0 ? sortedScaffolds[0].pscore : -1;
                    const highestPscoreRowClassName = getRowEntryColor(highestPscore);
                    return (
                        <React.Fragment key={index}>
                            {sortedScaffolds.map((scaffold, scaffoldIndex) => 
                                getRow(molData, scaffold, index, scaffoldIndex, highestPscoreRowClassName, molData.scaffolds.length, canGetDrugInfo)
                            )}
                            {getSeparator()}
                        </React.Fragment>
                    );
                }
                else if (validMol) {
                    // valid input SMILES given, but mol has no scaffolds (ie ring systems, excluding benzene)
                    return (
                        <React.Fragment key={index}>
                            {renderTableRow(
                                index,
                                0,
                                molData,
                                null,
                                getRowEntryColor(-1),
                                1,
                                false
                            )}
                            {getSeparator()}
                        </React.Fragment>
                    );
                }
                else {
                    // invalid SMILES 
                    return (
                        <React.Fragment key={index}>
                            <td colSpan={TABLE_N_COLUMNS} className="py-4 text-center text-red-500">
                                <p className={MOL_COL_TEXT}>Name: {molName}</p>
                                <p className={MOL_COL_TEXT}>Given SMILES: {molSmilesStr}</p>
                                <p>{molData.error_msg}</p>
                            </td>
                            {getSeparator()}
                        </React.Fragment>
                    );
                }
            })}
        </tbody>
    )
}

const getResultsTable = (moleculeInfos: MoleculeInfo[], canGetDrugInfo: boolean): React.ReactNode => {
    return (
        <table id="table-results" className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className={COLUMN_HEADER_TEXT}>MolName</th>
                    <th className={COLUMN_HEADER_TEXT}>Molecule</th>
                    <th className={COLUMN_HEADER_TEXT}>Scaffold</th>
                    <th className={COLUMN_HEADER_TEXT}>InDrug</th>
                    <th className={COLUMN_HEADER_TEXT}>Pscore</th>
                    <th className={COLUMN_HEADER_TEXT}>Substance Details</th>
                    <th className={COLUMN_HEADER_TEXT}>Assay Details</th>
                    <th className={COLUMN_HEADER_TEXT}>Sample Details</th>
                </tr>
            </thead>
            {getMoleculeRows(moleculeInfos, canGetDrugInfo)}
        </table>
    );
};


const generateTSVData = (moleculeInfos: MoleculeInfo[]) => {
    const headers = [
        'molIdx', 'molSmiles', 'molName', 'validMol', 'scafSmiles', 'inDB', 'scafID', 'pScore', 'inDrug',
        'substancesTested', 'substancesActive', 'assaysTested', 'assaysActive',
        'samplesTested', 'samplesActive'
    ];

    const rows = moleculeInfos.flatMap((molData, molIdx) => {
        const validMol = (molData.scaffolds !== undefined && molData.scaffolds !== null);
        if (validMol && molData.scaffolds.length > 0) {
            return molData.scaffolds.map((scaffold) => {
                return [
                    molIdx,
                    molData.molecule_smiles,
                    molData.name,
                    validMol,
                    scaffold.scafsmi,
                    scaffold.in_db,
                    scaffold.id,
                    scaffold.pscore,
                    scaffold.in_drug,
                    scaffold.nsub_tested,
                    scaffold.nsub_active,
                    scaffold.nass_tested,
                    scaffold.nass_active,
                    scaffold.nsam_tested,
                    scaffold.nsam_active
                ].join('\t');
            });
        }
        return [
            molIdx,
            molData.molecule_smiles,
            molData.name,
            validMol,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ].join('\t');
    });

    return [headers.join('\t'), ...rows].join('\n');
};

const downloadTSV = (moleculeInfos: MoleculeInfo[]) => {
    const tsvData = generateTSVData(moleculeInfos);
    const blob = new Blob([tsvData], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'badapple_out.tsv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export default function ChemPage(props: ChemPageProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const moleculesPerPage = 5;
    const moleculeInfos = props.result;
    const canGetDrugInfo = props.canGetDrugInfo;

    const handlePageChange = (newPage: number) => {
        if (newPage !== currentPage) {
          setCurrentPage(newPage);
        }
    };

    const paginatedMoleculeInfos = moleculeInfos.slice(
        (currentPage - 1) * moleculesPerPage,
        currentPage * moleculesPerPage
    );
    return (
        <div id="chem-page" className="relative z-10">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => {
                    props.setChem(false)
                }} className="btn-back">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/>
                    <span>Back</span>
                </button>
                <button onClick={() => downloadTSV(moleculeInfos)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Download TSV
                </button>
            </div>  
            <div className="glass-container active p-3">
                {getResultsTable(paginatedMoleculeInfos, canGetDrugInfo)}
                <Pagination
                    currentPage={currentPage}
                    totalMolecules={moleculeInfos.length}
                    moleculesPerPage={moleculesPerPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}