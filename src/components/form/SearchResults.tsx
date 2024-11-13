import {useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faUpload } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import Papa from 'papaparse';
import InputOptionsTable, { InputOptions } from './InputOptions';
import OutputOptionsTable, { OutputOptions } from './OutputOptions';
import './SearchResults.css';

interface SearchResultsProps {
    setChem: (chem: any) => void;
}

interface ParsedData {
    smilesList: string[];
    nameList: string[];
}

const DEFAULT_INPUT_OPTIONS: InputOptions = {
    format: 'SMILES',
    delimiter: ' ',
    smilesCol: 0,
    nameCol: 1,
    hasHeader: false
};

const DEFAULT_OUTPUT_OPTIONS: OutputOptions = {
    startIdx: 0,
    maxMolecules: 10,
    maxRings: 5
};

const MAX_INPUT_SIZE = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_FILE_EXTENSIONS = ['.txt', '.smi', '.tsv', '.csv', '.smiles'];

const EXAMPLE_SMILES = `CCCc1nc-2c(=O)n(c(=O)nc2n(n1)C)C mol1
c1ccc2c(c1)c(=O)n(s2)c3ccccc3C(=O)N4CCCC4 mol2
Cc1cc(nc(n1)N=C(N)Nc2cccc(c2)N)C mol3
CCc1c(c2ccccc2o1)C(=O)c3cc(c(c(c3)Br)O)Br mol4
OC(=O)C1=C2CCCC(C=C3C=CC(=O)C=C3)=C2NC2=CC=CC=C12 mol5
c1ccc2c(c1)C(=O)c3ccoc3C2=O mol6`;

const parseQuery = (rawText: string, delimiter: string, colIdx: number, hasHeader: boolean): string[] => {
    const results = Papa.parse(rawText, {
        delimiter: delimiter === "\\t" ? "\t" : delimiter,
        header: hasHeader,
        skipEmptyLines: true
    });

    if (hasHeader) {
        return results.data.map((row: any) => row[Object.keys(row)[colIdx]]);
    }
    return results.data.map((row: any) => row[colIdx]);
};

const parseInputData = (
    query: string,
    { delimiter, smilesCol, nameCol, hasHeader }: InputOptions,
    { startIdx, maxMolecules }: OutputOptions
): ParsedData => {
    const smilesList = parseQuery(query, delimiter, smilesCol, hasHeader).slice(startIdx, startIdx + maxMolecules);
    const nameList = parseQuery(query, delimiter, nameCol, hasHeader)
        .slice(startIdx, startIdx + maxMolecules)
        .map((name, index) => name || `${index}`);
    
    return { smilesList, nameList };
};

async function fetchScaffolds(data: ParsedData, maxRings: number) {
    const apiUrl = import.meta.env.VITE_API_HOST;
    try {
        const response = await axios.get(apiUrl, {
            params: {
                SMILES: data.smilesList.join(','),
                Names: data.nameList.join(','),
                max_rings: maxRings
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching scaffolds:', error);
        return null;
    }
}

const SearchResults: React.FC<SearchResultsProps> = ({ setChem }) => {
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [inputOptions, setInputOptions] = useState<InputOptions>(DEFAULT_INPUT_OPTIONS);
    const [outputOptions, setOutputOptions] = useState<OutputOptions>(DEFAULT_OUTPUT_OPTIONS);

    useEffect(() => {
        if (Object.keys(searchResults).length > 0) {
            setChem(searchResults);
        }
    }, [searchResults, setChem]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!SUPPORTED_FILE_EXTENSIONS.includes(fileExtension)) {
            alert(`Unsupported file type. Please upload: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`);
            return;
        }

        if (file.size > MAX_INPUT_SIZE) {
            alert('File size exceeds the 5 MB limit. Please upload a smaller file.');
            return;
        }

        const text = await file.text();
        setSearchInput(text);
    };

    const handleSubmit = async () => {
        if (!searchInput  || isLoading) return;
        
        setIsLoading(true);
        try {
            const parsedData = parseInputData(searchInput, inputOptions, outputOptions);
            const data = await fetchScaffolds(parsedData, outputOptions.maxRings);
            if (data) {
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Error processing submission:', error);
            alert('An error occurred while processing your request.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateOption = <T extends Record<string, any>>(
        setter: React.Dispatch<React.SetStateAction<T>>,
        key: keyof T,
        value: any
    ) => {
        setter(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <section className="mb-2">
                <div className="flex mb-2 gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                    >
                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                        Upload File
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept={SUPPORTED_FILE_EXTENSIONS.join(',')}
                        className="hidden"
                    />
                    <button 
                        onClick={() => setSearchInput('')}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear Input
                    </button>
                    <button 
                        onClick={() => setSearchInput(EXAMPLE_SMILES)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Example Input
                    </button>
                </div>
                <div className="flex-container">
                    <textarea
                        placeholder="Enter SMILES (Press Enter for new line)"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onPaste={(e) => {
                            if (e.clipboardData.getData('text').length + searchInput.length > MAX_INPUT_SIZE) {
                                e.preventDefault();
                                alert('Pasting this content would exceed the 5 MB limit.');
                            }
                        }}
                        maxLength={5000000}
                        className="w-full h-60 p-2 mb-4 border dark:border-gray-600/40 backdrop-blur-md dark:bg-gray-600/30 dark:hover:bg-gray-600/50 dark:focus:bg-gray-600/50 dark:active:bg-gray-600/50 resize-y"
                        style={{ width: '56rem' }}
                    />
                    <div className="flex-container">
                        <InputOptionsTable 
                            inputOptions={inputOptions}
                            updateInputOptions={(key, value) => updateOption(setInputOptions, key, value)}
                        />
                        <OutputOptionsTable 
                            outputOptions={outputOptions}
                            updateOutputOptions={(key, value) => updateOption(setOutputOptions, key, value)}
                        />
                    </div>
                </div>
            </section>
            <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-2 mt-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Submit
            </button>
            {Object.keys(searchResults).length > 0 && (
                <section className={`glass-container gap-0 p-0 ${isLoading ? 'active' : ''}`}>
                    {isLoading && (
                        <div className="loader active">
                            <FontAwesomeIcon icon={faCircleNotch} className="text-primary animate-spin"/>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default SearchResults;