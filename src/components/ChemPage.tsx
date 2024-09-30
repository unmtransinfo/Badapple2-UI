import {Dispatch, SetStateAction, ReactNode} from "react";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import MoleculeStructure from "./MoleculeStructure.tsx";

// define interfaces
interface ScaffoldInfo {
    scafsmi: string;
    id: number;
    pscore: number;
    in_db: boolean;
    in_drug: boolean;
}

interface ChemPageProps {
    result: {
        [molecule_smiles: string]: ScaffoldInfo[];
    };
    setChem: Dispatch<SetStateAction<any>>;
}



// for visualizing score advisory color
const getRowClassName = (pscore: number) => {
    if (pscore >= 300) return "bg-red-300";
    if (pscore >= 100) return "bg-yellow-300";
    if (pscore >= 0) return "bg-green-300";
    return "bg-gray-300";
};


const getInfoRows = (molecule_smiles: string, scaffoldInfos: ScaffoldInfo[], index: number): ReactNode => {
    const moleculeStructure = (
        <MoleculeStructure
            id={`mol-smile-svg-${index}`}
            structure={molecule_smiles}
            width={350}
            height={300}
            svgMode={true}
            className="mb-4"
        />
    );

    // Sort the scaffolds array by pscore in descending order
    const sortedScaffolds = scaffoldInfos.sort((a, b) => b.pscore - a.pscore);

    // Get the highest pscore and its corresponding row class name (for molecule column color)
    const highestPscore = sortedScaffolds.length > 0 ? sortedScaffolds[0].pscore : -1;
    const highestPscoreRowClassName = getRowClassName(highestPscore);

    return (
        <section key={index}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Molecule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Scaffold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">InDrug</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pscore</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedScaffolds.map((scaffold, scaffoldIndex) => {
                        const { scafsmi, pscore, in_db, in_drug } = scaffold;
                        const inDrugString = !in_db ? "NULL" : (in_drug ? "True" : "False");
                        const pscoreString = !in_db ? "NULL" : pscore;
                        const weightedScore = !in_db ? -1 : pscore; // make score -1 to show colors correctly
                        const rowClassName = getRowClassName(weightedScore);
                        return (
                            <tr key={`${index}-${scaffoldIndex}`} className={rowClassName}>
                                <td className={`px-6 py-4 whitespace-nowrap border-r border-gray-200 ${highestPscoreRowClassName}`}>
                                    {moleculeStructure}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">{inDrugString}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pscoreString}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </section>
    );
}

export default function ChemPage(props: ChemPageProps) {
    return (
        <div id="chem-page" className="relative z-10">
            <button onClick={() => {
                props.setChem(undefined)
            }} className="btn-back">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/>
                <span>Back</span>
            </button>
            <div className="glass-container active p-3">
                {Object.entries(props.result).map(([molecule_smiles, scaffoldInfos], keyIndex) => (
                    <div key={keyIndex}>
                        {getInfoRows(molecule_smiles, scaffoldInfos, keyIndex)}
                    </div>
                ))}
            </div>
        </div>
    );
}