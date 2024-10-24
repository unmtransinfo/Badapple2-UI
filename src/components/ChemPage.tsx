import React, {Dispatch, SetStateAction, ReactNode, useState} from "react";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import MoleculeStructure from "./MoleculeStructure.tsx";
import Pagination from "./Pagination.tsx";

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
interface MoleculeInfo {
    molecule_smiles: string;
    name: string;
    scaffolds: ScaffoldInfo[];
    error_msg: string,
};

interface ChemPageProps {
    result:  MoleculeInfo[];
    setChem: Dispatch<SetStateAction<any>>;
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
const getRowClassName = (pscore: number) => {
    if (pscore >= 300) return "bg-red-300";
    if (pscore >= 100) return "bg-yellow-300";
    if (pscore >= 0) return "bg-green-300";
    return "bg-gray-300";
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


const getRow = (molData: MoleculeInfo, scaffold: ScaffoldInfo, index: number, scaffoldIndex: number, highestPscoreRowClassName: string): ReactNode => {
    const { scafsmi, pscore, in_db, in_drug} = scaffold;
    const inDrugString = !in_db ? "NULL" : (in_drug ? "True" : "False");
    const pscoreString = !in_db ? "NULL" : pscore;
    const detailsArray = buildDetailsArray(scaffold);
    const weightedScore = !in_db ? -1 : pscore; // make score -1 to show colors correctly
    const rowClassName = getRowClassName(weightedScore);
    return (
        <tr key={`${index}-${scaffoldIndex}`} className={rowClassName}>
            <td className={`px-6 py-4 whitespace-nowrap border-r border-gray-200 ${highestPscoreRowClassName}`}>
                <div className="mb-4">
                    <p className="whitespace-nowrap text-2xl text-gray-900">Name: {truncateName(molData.name, 16)}</p>
                    <MoleculeStructure
                        id={`mol-smile-svg-${index}-${scaffoldIndex}`}
                        structure={molData.molecule_smiles}
                        subStructure={transformSmiles(scafsmi)}
                        width={350}
                        height={300}
                        svgMode={true}
                        className="mb-4"
                    />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                <MoleculeStructure
                    id={`scaf-smile-svg-${index}-${scaffoldIndex}`}
                    structure={scafsmi}
                    width={350}
                    height={300}
                    svgMode={true}
                    className="mb-4"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-2xl text-gray-900 border-r border-gray-200">{inDrugString}</td>
            <td className="px-6 py-4 whitespace-nowrap text-2xl text-gray-900 border-r border-gray-200">{pscoreString}</td>
            <td className="px-6 py-4 whitespace-nowrap text-2xl text-gray-900">
                    {detailsArray.map((detail, detailIndex) => (
                        <div key={detailIndex}>{detail}</div>
                    ))}
            </td>
        </tr>
    );
}

const getMoleculeRows = (moleculeInfos: MoleculeInfo[]) : React.ReactNode => {
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
                        if (b.pscore === undefined) return -1;
                        if (a.pscore === undefined) return 1;
                        return b.pscore - a.pscore;
                    });

                    // Get the highest pscore and its corresponding row class name (for molecule column color)
                    const highestPscore = sortedScaffolds.length > 0 ? sortedScaffolds[0].pscore : -1;
                    const highestPscoreRowClassName = getRowClassName(highestPscore);

                    return (
                        <React.Fragment key={index}>
                            {sortedScaffolds.map((scaffold, scaffoldIndex) => 
                                getRow(molData, scaffold, index, scaffoldIndex, highestPscoreRowClassName)
                            )}
                            <tr>
                                <td colSpan={5} className="py-2">
                                    <hr className="border-t-2 border-gray-300" />
                                </td>
                            </tr>
                        </React.Fragment>
                    );
                }
                else if (validMol) {
                    // valid input SMILES given, but mol has no scaffolds (ie ring systems, excluding benzene)
                    // Get the highest pscore and its corresponding row class name (for molecule column color)
                    return (
                        <React.Fragment key={index}>
                            <tr className={getRowClassName(-1)}>
                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                    <div className="mb-4">
                                        <p className="whitespace-nowrap text-2xl text-gray-900">Name: {truncateName(molData.name, 16)}</p>
                                        <MoleculeStructure
                                            id={`mol-smile-svg-${index}`}
                                            structure={molData.molecule_smiles}
                                            width={350}
                                            height={300}
                                            svgMode={true}
                                            className="mb-4"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-2xl text-gray-900 border-r border-gray-200">Molecule has no scaffolds</td>
                                <td className="px-6 py-4 whitespace-nowrap text-2xl text-gray-900 border-r border-gray-200"></td>
                                <td className="px-6 py-4 whitespace-nowrap text-2xl text-gray-900 border-r border-gray-200"></td>
                                <td className="px-6 py-4 whitespace-nowrap text-2xl text-gray-900 border-r border-gray-200"></td>
                            </tr>
                            <tr>
                                <td colSpan={5} className="py-2">
                                    <hr className="border-t-2 border-gray-300" />
                                </td>
                            </tr>
                        </React.Fragment>
                    );
                }
                else {
                    return (
                        <React.Fragment key={index}>
                            <td colSpan={5} className="py-4 text-center text-red-500">
                                <p className="whitespace-nowrap text-2xl text-gray-900">Name: {molName}</p>
                                <p className="whitespace-nowrap text-2xl text-gray-900">Given SMILES: {molSmilesStr}</p>
                                <p>{molData.error_msg}</p>
                            </td>
                            <tr>
                                <td colSpan={5} className="py-2">
                                    <hr className="border-t-2 border-gray-300" />
                                </td>
                            </tr>
                        </React.Fragment>
                    );
                }
            })}
        </tbody>
    )
}

const getResultsTable = (moleculeInfos: MoleculeInfo[]): React.ReactNode => {
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Molecule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Scaffold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">InDrug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Pscore</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
            </thead>
            {getMoleculeRows(moleculeInfos)}
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

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const paginatedMoleculeInfos = moleculeInfos.slice(
        (currentPage - 1) * moleculesPerPage,
        currentPage * moleculesPerPage
    );
    return (
        <div id="chem-page" className="relative z-10">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => {
                    props.setChem(undefined)
                }} className="btn-back">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/>
                    <span>Back</span>
                </button>
                <button onClick={() => downloadTSV(moleculeInfos)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Download TSV
                </button>
            </div>  
            <div className="glass-container active p-3">
                {getResultsTable(paginatedMoleculeInfos )}
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