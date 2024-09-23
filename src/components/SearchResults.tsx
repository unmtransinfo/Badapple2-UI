import {Input} from "@nextui-org/react";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
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

    // TODO: remove console.log statements
    const fetchData = async (query: string) => {
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
        // this code will run every time searchResults changes
        console.log("Search results (in effect):");
        console.log(searchResults);
        if (searchResults && Object.keys(searchResults).length > 0) {
            setChem(searchResults);
        }
    }, [searchResults]);

    const onSearchInput = (e) => {
        setSearchInput(e);
    }

    const onSMILESInput = () => {
        //setSearchResults([]);
        fetchData(searchInput);
    };
    
    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            console.log("Enter key pressed");
            onSMILESInput();
        }
    };

    return (
        <div>
            <div id="search-container">
                <section className="w-1/2 m-auto">
                    <Input
                        id="search-input"
                        key="default"
                        color="default"
                        size="lg"
                        label="Input"
                        placeholder="Enter SMILES"
                        defaultValue=""
                        isClearable
                        onClear={() => setSearchResults([])}
                        onKeyUp={handleKeyUp}
                        onValueChange={onSearchInput}
                        classNames={{
                            inputWrapper: [
                                "border",
                                "dark:border-gray-600/40",
                                "backdrop-blur-md",
                                "dark:bg-gray-600/30",
                                "dark:hover:bg-gray-600/50",
                                "dark:focus:bg-gray-600/50",
                                "dark:active:bg-gray-600/50",
                                "mb-8"
                            ],
                        }}
                    />
                </section>

                <section className={'glass-container gap-0 p-0 ' + (searchResults.length ? 'active' : '')}>
                    <div className={'loader ' + (loader ? 'active' : '')}>
                        <FontAwesomeIcon icon={faCircleNotch} className="text-primary animate-spin"/>
                    </div>
                </section>

            </div>
        </div>
    )
}
