import { SetStateAction, useState, useEffect, useRef } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleNotch, faUpload } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import UserOptionsTable, { UserOptions } from './UserOptions';
import './SearchResults.css';

interface SearchResultsProps {
    setChem: (chem: any) => void;
}

const parseQuery = (rawText: string, delimiter: string, smilesCol: number, hasHeader: boolean): string => {
    console.log("Query pre-parse: %s ", rawText);
    const lines = rawText.split('\n');
    const smilesList = lines
        .slice(hasHeader ? 1 : 0) // Skip the header if hasHeader is true
        .map(line => line.split(delimiter)[smilesCol]) // Extract the SMILES string based on smilesCol
        .filter(smiles => smiles) // Filter out any empty strings
        .join(','); // Join the SMILES strings with commas
    console.log("Post-parse: %s ", smilesList);
    return smilesList;
};

async function fetchScaffolds(inputSMILES: string) {
    const apiUrl = import.meta.env.VITE_API_HOST;
    return await axios.get(apiUrl, {
        params: {
            SMILES: inputSMILES
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
    

    const updateUserOptions = (key: keyof UserOptions, value: any) => {
        setUserOptions((prevOptions: any) => ({
            ...prevOptions,
            [key]: value
        }));
    };
    const supportedFileExtensions = ['.txt', '.smi', '.tsv', '.csv', '.smiles'];

    const fetchData = async (query: string, delimiter: string, smilesCol: number, hasHeader: boolean) => {
        if (query && query.length) {
            setLoader(true);
            console.log("Input: %s", query);
            const inputSMILES = parseQuery(query, delimiter, smilesCol, hasHeader);
            console.log("Parsed SMILES: %s", inputSMILES);
            const data = await fetchScaffolds(inputSMILES);
            
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
        fetchData(searchInput, userOptions.delimiter, userOptions.smilesCol, userOptions.hasHeader);
    };
    
    const handleKeyDown = (e: { key: string; shiftKey: any; preventDefault: () => void; }) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, supportedExtensions: string[]) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            
            if (!fileExtension || !supportedExtensions.includes(`.${fileExtension}`)) {
                alert(`Unsupported file type. Please upload a file with one of the following extensions: ${supportedExtensions.join(', ')}`);
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
                    </div>
                    <div className="flex-container">
                        <textarea
                            id="search-input"
                            placeholder="Enter SMILES (Press Shift+Enter for new line)"
                            value={searchInput}
                            onChange={onSearchInput}
                            onKeyDown={handleKeyDown}                 
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