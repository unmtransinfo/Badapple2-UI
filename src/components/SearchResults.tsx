import { Dispatch,SetStateAction, useState, useEffect, useRef } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCircleNotch, faUpload } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

async function fetchScaffolds(inputSMILES: string) {
    const apiUrl = import.meta.env.VITE_API_HOST;
    console.log("Input SMILES: %s", inputSMILES);
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
export default function SearchResults({ setChem }: { setChem: Dispatch<SetStateAction<object>> }) {
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState({});
    const [loader, setLoader] = useState(false);
    const fileInputRef = useRef(null);

    const fetchData = async (query) => {
        if (query && query.length) {
            setLoader(true);
            const data = await fetchScaffolds(query);
            
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

    const onSearchInput = (e) => {
        setSearchInput(e.target.value);
    }

    const onSubmit = () => {
        fetchData(searchInput);
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSearchInput(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div>
            <div id="search-container" className="w-full max-w-3xl mx-auto">
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
                            onChange={handleFileUpload}
                            accept=".txt"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <textarea
                        id="search-input"
                        placeholder="Enter SMILES (Press Shift+Enter for new line, Enter to submit)"
                        value={searchInput}
                        onChange={onSearchInput}
                        onKeyDown={handleKeyDown}
                        className="w-full h-40 p-2 mb-4 border dark:border-gray-600/40 backdrop-blur-md dark:bg-gray-600/30 dark:hover:bg-gray-600/50 dark:focus:bg-gray-600/50 dark:active:bg-gray-600/50 resize-y"
                    />
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
