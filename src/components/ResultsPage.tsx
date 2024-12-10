/*
@author Jack Ringer
Date: 12/9/2024
Description:
Page showing the results table.
*/
import React, {Dispatch, SetStateAction, ReactNode, useState} from "react";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import MoleculeStructure from "./MoleculeStructure.tsx";
import Pagination from "./Pagination.tsx";
import DrugDetails from "./DrugDetails.tsx";
import TargetDetails from "./TargetDetails.tsx";
import { createRoot } from 'react-dom/client'

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

interface ResultsPageProps {
    result:  MoleculeInfo[];
    canGetDrugInfo: boolean;
    canGetTargetInfo: boolean;
    setChem: Dispatch<SetStateAction<any>>;
}

const COLUMN_HEADER_TEXT = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200";
const MOL_COL_TEXT = "whitespace-nowrap text-s font-medium text-gray-900";
const SVG_WIDTH = 200;
const SVG_HEIGHT = 125;

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
    console.log({
        pscore,
        isNull: pscore === null,
        isUndefined: pscore === undefined,
        isNegative: pscore < 0,
        type: typeof pscore
      });
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
        `sTested: ${nsub_tested}`,
        `sActive: ${nsub_active}`,
        `aTested: ${nass_tested}`,
        `aActive: ${nass_active}`,
        `wTested: ${nsam_tested}`,
        `wActive: ${nsam_active}`
    ];
};


const truncateName = (name: string, maxLength: number) => {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
};

const displayPopupWindow = async(popupName: string, popupWindowName: string, componentToRender: ReactNode) => {
    const popupWindow = window.open("", popupName, "width=600,height=400");
    if (popupWindow) {
        popupWindow.document.write(`<html><head><title>${popupWindowName}</title></head><body><div id='drug-details-root'></div></body></html>`);
        popupWindow.document.close();
        const root = popupWindow.document.getElementById('drug-details-root');
        if (root) {
            createRoot(root).render(componentToRender);
        } else {
            console.error("Failed to find root element");
        }
    } else {
        console.error("Failed to open popup window");
    }
}


const displayDrugDetails = async(scaffoldID: number, scaffoldImage: ReactNode) => {
    const popupName = `DrugDetailsPopup_${scaffoldID}`;
    const popupWindowName = `Drug Details scafid=${scaffoldID}`;
    displayPopupWindow(popupName, popupWindowName, <DrugDetails scaffoldID={scaffoldID} scaffoldImage={scaffoldImage}/>);
}


const displayTargetDetails = async(scaffoldID: number, scaffoldImage: ReactNode) => {
    const popupName = `TargetDetailsPopUp_${scaffoldID}`;
    const popupWindowName = `Target Details scafid=${scaffoldID}`;
    displayPopupWindow(popupName, popupWindowName, <TargetDetails scaffoldID={scaffoldID} scaffoldImage={scaffoldImage}/>);
}

const renderTableRow = (
    index: number,
    scaffoldIndex: number,
    molData: any,
    scaffold: ScaffoldInfo | null,
    highestPscoreColor: string,
    nRows: number,
    canGetDrugInfo: boolean,
    canGetTargetInfo: boolean
) => {
    const { scafsmi = "", pscore = null, in_db = null, in_drug = null } = scaffold || {};
    const scaffoldImage = scafsmi ? <MoleculeStructure
                                        id={`scaf-smile-svg-${index}-${scaffoldIndex}`}
                                        structure={scafsmi}
                                        width={SVG_WIDTH}
                                        height={SVG_HEIGHT}
                                        svgMode={true}
                                        className="mb-0"
                                /> : null;
    const inDrugString = !in_db ? (scaffold ? "NULL" : "") : (in_drug ? "True" : "False");
    const pscoreString = !in_db ? (scaffold ? "NULL" : "") : String(pscore);
    const detailsArray = scaffold ? buildDetailsArray(scaffold) : [];
    const rowColor = (pscore !== null && pscore !== undefined) ? getRowEntryColor(pscore) : getRowEntryColor(-1);
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
            {scaffoldImage ? (
                <td id="table-results" className="px-6 py-4 whitespace-nowrap border-r border-gray-200">{scaffoldImage}</td>)
                : (
                <td id="table-results" className={otherColClass}>Has no scaffolds <br></br>or &gt;maxRings</td>
            )}
            <td className={otherColClass}>
                {scaffold && scaffoldImage && in_drug && canGetDrugInfo ? (
                    <a href="#" onClick={(event) => {
                        event.preventDefault();
                        displayDrugDetails(scaffold.id, scaffoldImage);
                    }} className="clickable-link">
                        {inDrugString}
                    </a>
                ) : (
                    inDrugString
                )}
            </td>
            <td id="table-results" className={otherColClass}>{pscoreString ? pscoreString : ""}</td>
            {in_db && detailsArray && detailsArray.length === 6 ? (
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
            {canGetTargetInfo ? (
                    <td className={otherColClass}>
                        {scaffold && scaffoldImage && in_db ? (
                            <a href="#" onClick={(event) => {
                                event.preventDefault();
                                displayTargetDetails(scaffold.id, scaffoldImage);
                            }} className="clickable-link">
                                {"Click Here"}
                            </a>
                        ) : (
                            "" // for valid mols with no scaffolds
                        )}
                    </td>
            ) : (
                <></>
            )}
        </tr>
    );
};

const getSeparator = (nColumns: number) => { 
    // separator shown between scaffolds for different molecules
    return (
        <tr>
            <td colSpan={nColumns} className="py-2">
                <hr className="border-t-2 border-gray-300" />
            </td>
        </tr>)
}


const getMoleculeRows = (moleculeInfos: MoleculeInfo[], canGetDrugInfo: boolean, canGetTargetInfo: boolean, nColumns: number) : React.ReactNode => {
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
                                renderTableRow(index, scaffoldIndex, molData, scaffold, highestPscoreRowClassName, 
                                    molData.scaffolds.length, canGetDrugInfo, canGetTargetInfo)
                            )}
                            {getSeparator(nColumns)}
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
                                false,
                                canGetTargetInfo // helps make the display consistent/not have gaps
                            )}
                            {getSeparator(nColumns)}
                        </React.Fragment>
                    );
                }
                else {
                    // invalid SMILES 
                    return (
                        <React.Fragment key={index}>
                            <td colSpan={nColumns} className="py-4 text-center text-red-500">
                                <p className={MOL_COL_TEXT}>Name: {molName}</p>
                                <p className={MOL_COL_TEXT}>Given SMILES: {molSmilesStr}</p>
                                <p>{molData.error_msg}</p>
                            </td>
                            {getSeparator(nColumns)}
                        </React.Fragment>
                    );
                }
            })}
        </tbody>
    )
}

const getResultsTable = (moleculeInfos: MoleculeInfo[], canGetDrugInfo: boolean, canGetTargetInfo: boolean): React.ReactNode => {
    const nColumns = canGetTargetInfo ? 9 : 8;
    return (
        <table id="table-results" className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className={COLUMN_HEADER_TEXT}>MolName</th>
                    <th className={COLUMN_HEADER_TEXT}>Molecule</th>
                    <th className={COLUMN_HEADER_TEXT}>Scaffold</th>
                    <th className={COLUMN_HEADER_TEXT}>InDrug</th>
                    <th className={COLUMN_HEADER_TEXT}>pScore</th>
                    <th className={COLUMN_HEADER_TEXT}>Substance Details</th>
                    <th className={COLUMN_HEADER_TEXT}>Assay Details</th>
                    <th className={COLUMN_HEADER_TEXT}>Sample Details</th>
                    {canGetTargetInfo ? (<th className={COLUMN_HEADER_TEXT}>Active Targets</th>) : (<></>)}
                </tr>
            </thead>
            {getMoleculeRows(moleculeInfos, canGetDrugInfo, canGetTargetInfo, nColumns)}
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

export default function ResultsPage(props: ResultsPageProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const moleculesPerPage = 5;
    const moleculeInfos = props.result;

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
                {getResultsTable(paginatedMoleculeInfos, props.canGetDrugInfo, props.canGetTargetInfo)}
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