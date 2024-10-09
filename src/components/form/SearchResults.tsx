import { SetStateAction, useState, useEffect, useRef } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleNotch, faUpload } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import UserOptionsTable, { UserOptions } from './UserOptions';
import './SearchResults.css';
import Papa from 'papaparse';

interface SearchResultsProps {
    setChem: (chem: any) => void;
}

// TODO: fix edge case, if single molecule given with no name column then not parsed correctly
const parseQuery = (rawText: string, delimiter: string, colIdx: number, hasHeader: boolean): string[] => {
    const results = Papa.parse(rawText, {
        delimiter: delimiter,
        header: hasHeader,
        skipEmptyLines: true
    });

    if (hasHeader) {
        return results.data.map((row: any) => row[Object.keys(row)[colIdx]]);
    } else {
        return results.data.map((row: any) => row[colIdx]);
    }
};

async function fetchScaffolds(smilesList: string[], nameList: string[]) {
    const inputSMILES = smilesList.join(',');
    const inputNames = nameList.join(',');
    const apiUrl = import.meta.env.VITE_API_HOST;
    return await axios.get(apiUrl, {
        params: {
            SMILES: inputSMILES,
            Names: inputNames
        }
    })
        .then(promise => {
            return promise.data;
        })
        .catch(e => {
            console.error(e);
        })
}

// TODO: refactor some of this, right now its a mess
const SearchResults: React.FC<SearchResultsProps> = ({ setChem }) => {
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState({});
    const [loader, setLoader] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userOptions, setUserOptions] = useState<UserOptions>({
        format: 'SMILES',
        delimiter: ' ',
        smilesCol: 0,
        nameCol: 1,
        hasHeader: false
    });
    const maxInputSizeInBytes = 5 * 1024 * 1024; // 5 MB

    

    const updateUserOptions = (key: keyof UserOptions, value: any) => {
        setUserOptions((prevOptions: any) => ({
            ...prevOptions,
            [key]: value
        }));
    };
    const supportedFileExtensions = ['.txt', '.smi', '.tsv', '.csv', '.smiles'];

    const fetchData = async (query: string, delimiter: string, smilesCol: number, nameCol: number, hasHeader: boolean) => {
        if (query && query.length) {
            setLoader(true);
            delimiter = delimiter === "\\t" ? "\t" : delimiter; // html saves tab as "\\t" instead of "\t"
            const smilesList = parseQuery(query, delimiter, smilesCol, hasHeader);
            const nameList = parseQuery(query, delimiter, nameCol, hasHeader);
            const data = await fetchScaffolds(smilesList, nameList);
            
            if (data) {
                setSearchResults(data);
            }
            setLoader(false);
        }
    };
    
    useEffect(() => {
        if (searchResults && Object.keys(searchResults).length > 0) {
            setChem(searchResults);
        }
    }, [searchResults, setChem]);

    const onSearchInput = (e: { target: { value: SetStateAction<string>; }; }) => {
        setSearchInput(e.target.value);
    }

    const onSubmit = () => {
        fetchData(searchInput, userOptions.delimiter, userOptions.smilesCol, userOptions.nameCol, userOptions.hasHeader);
    };
    
    const handleKeyDown = (e: { key: string; shiftKey: any; preventDefault: () => void; }) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const paste = e.clipboardData.getData('text');
        if (paste.length + searchInput.length > maxInputSizeInBytes) {
            alert('Pasting this content would exceed the 5 MB limit. Please paste a smaller amount of text.');
            e.preventDefault();
        }
    };

    const fillWithExampleSMILES = () => {
        const exampleSMILES = `CCCc1nc-2c(=O)n(c(=O)nc2n(n1)C)C mol1
c1ccc2c(c1)c(=O)n(s2)c3ccccc3C(=O)N4CCCC4 mol2
Cc1cc(nc(n1)N=C(N)Nc2cccc(c2)N)C mol3
CCc1c(c2ccccc2o1)C(=O)c3cc(c(c(c3)Br)O)Br mol4
OC(=O)C1=C2CCCC(C=C3C=CC(=O)C=C3)=C2NC2=CC=CC=C12 mol5
c1ccc2c(c1)C(=O)c3ccoc3C2=O mol6`;
        setSearchInput(exampleSMILES);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, supportedExtensions: string[]) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (!fileExtension || !supportedExtensions.includes(`.${fileExtension}`)) {
                alert(`Unsupported file type. Please upload a file with one of the following extensions: ${supportedExtensions.join(', ')}`);
                return;
            }

            if (file.size > maxInputSizeInBytes) {
                alert('File size exceeds the 5 MB limit. Please upload a smaller file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    setSearchInput(e.target.result);
                }
            };
            reader.readAsText(file);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleClear = () => {
        setSearchInput('');
    };

    return (
        <div>
            <div id="search-container" className="w-full max-w-5xl mx-auto">
                <section className="mb-4">
                    <div className="flex mb-2">
                        <button
                            onClick={triggerFileInput}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                        >
                            <FontAwesomeIcon icon={faUpload} className="mr-2" />
                            Upload File
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e, supportedFileExtensions)}
                            accept=".txt,.smi,.tsv,.csv,.smiles"
                            style={{ display: 'none' }}
                        />
                        <button onClick={handleClear} className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center">
                                Clear Input
                        </button>
                        <button onClick={fillWithExampleSMILES} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center">
                            Example Input
                        </button>
                    </div>
                    <div className="flex-container">
                        <textarea
                            id="search-input"
                            placeholder="Enter SMILES (Press Shift+Enter for new line)"
                            value={searchInput}
                            onChange={onSearchInput}
                            onKeyDown={handleKeyDown}  
                            maxLength={5000000} // 5 million characters
                            onPaste={handlePaste}               
                            className="w-full h-40 p-2 mb-4 border dark:border-gray-600/40 backdrop-blur-md dark:bg-gray-600/30 dark:hover:bg-gray-600/50 dark:focus:bg-gray-600/50 dark:active:bg-gray-600/50 resize-y"
                        />
                        <UserOptionsTable userOptions={userOptions} updateUserOptions={updateUserOptions} />
                    </div>
                    <br />
                    <button
                        onClick={onSubmit}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Submit
                    </button>
                </section>
                <section className={'glass-container gap-0 p-0 ' + (Object.keys(searchResults).length ? 'active' : '')}>
                    <div className={'loader ' + (loader ? 'active' : '')}>
                        <FontAwesomeIcon icon={faCircleNotch} className="text-primary animate-spin"/>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SearchResults;