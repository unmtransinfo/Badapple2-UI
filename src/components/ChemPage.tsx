import {Dispatch, SetStateAction} from "react";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import MoleculeStructure from "./MoleculeStructure.tsx";


export default function ChemPage(props: { result: Object, setChem: Dispatch<SetStateAction<any>> }) {
    return (
        <div id="chem-page" className="relative z-10">
            <button onClick={() => {
                props.setChem(undefined)
            }} className="btn-back">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/>
                <span>Back</span>
            </button>
            <div className="glass-container active p-3">
                <header className="mb-4">
                    <h1 className="text-3xl font-bold mb-2">{"Input Molecule"}</h1>
                    <header className="mb-2">
                        <h2 className="text-xl font-semibold">{"Canonical SMILES: " + props.result.molecule_cansmi}</h2>
                    </header>
                    <MoleculeStructure
                        id={`mol-smile-svg`}
                        structure={props.result.molecule_cansmi}
                        width={350}
                        height={300}
                        svgMode={true}
                        className="mb-4"
                    />
                </header>
                <section>
                    <h1 className="text-3xl font-bold mb-2">{"Scaffolds"}</h1>
                    {Array.isArray(props.result.scaffolds) && props.result.scaffolds.map((item, index) =>
                     (
                        <div key={index} className="mb-4">
                            <header className="mb-2">
                                <h2 className="text-xl font-semibold">{"Canonical SMILES: " + item}</h2>
                            </header>
                            <MoleculeStructure
                                id={`scaf-smile-svg-${index}`}
                                structure={item}
                                width={350}
                                height={300}
                                svgMode={true}
                                className="mb-4"
                            />
                        </div>
                    ))}
                </section>
            </div>
        </div>
    )
}
