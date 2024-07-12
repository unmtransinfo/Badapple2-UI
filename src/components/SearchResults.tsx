import {Input, Listbox, ListboxItem, ScrollShadow} from "@nextui-org/react";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNodes, faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import SearchResultsTable from "./SearchResultsTable.tsx";

async function fetchScaffolds(inputSMILES: string) {
    const apiUrl = import.meta.env.VITE_API_HOST;
    console.log("")
    return await axios.get(apiUrl, {
        params: {
            query: inputSMILES
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
    const [searchResults, setSearchResults] = useState([]);
    const [showResultsTable, setShowResultsTable] = useState(false);
    const searchResultBullet = <FontAwesomeIcon icon={faCircleNodes} className="text-primary mr-2" />;
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (searchInput && searchInput.length) {
                setLoader(true);

                const data = await fetchScaffolds(searchInput);

                if (data.length) {
                    setSearchResults(data);
                }
            }

            setLoader(false);
        }

        fetchData();
    }, [ searchInput ]);


    // TODO: use search table when given > 1 mol
    const onKeyUpTable = (e) => {
        setShowResultsTable(e.keyCode == 27);
    }

    const onKeyUpResultPage = (e) => {
        setShowResultsTable(e.keyCode == 13)
    }

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
                        onKeyUp={onKeyUpResultPage}
                        isClearable
                        onClear={() => setSearchResults([])}
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

                    {!showResultsTable &&
                        <ScrollShadow size={100} className="scroll-shadow">
                            <Listbox id="search-results-list" variant="flat" aria-label="Search Results">
                                {
                                    searchResults.map((result, index) => (
                                        <ListboxItem
                                            key={index}
                                            description={(result.pert_name + ' - ' + result.moa)}
                                            startContent={searchResultBullet}
                                            className="search-result"
                                            color="primary"
                                            classNames={{
                                                base: "text-xl",
                                                title: "text-lg transition-colors",
                                                description: "text-sm transition-colors"
                                            }}
                                            onClick={() => {
                                                setChem(result)
                                            }}
                                        >
                                            {result.pert_name}
                                        </ListboxItem>
                                    ))
                                }
                            </Listbox>
                        </ScrollShadow>
                    }
                </section>

            </div>

            <section className="w-100">
                {showResultsTable &&
                    <SearchResultsTable searchResults={searchResults}
                                        setChem={setChem}  />
                }
            </section>
        </div>
    )
}
