/*
@author Jack Ringer
Date: 12/5/2024
Description:
File containing API calls to Badapple2-API and related utilities (like parsing inputs).
https://github.com/unmtransinfo/Badapple2-API
*/
import axios from 'axios';
import Papa from 'papaparse';
import { InputOptions } from './components/form/InputOptions';
import { OutputOptions } from './components/form/OutputOptions';

// related to fetching scaffolds
interface ParsedInputData {
    smilesList: string[];
    nameList: string[];
}

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

export const parseInputData = (
    query: string,
    { delimiter, smilesCol, nameCol, hasHeader }: InputOptions,
    { startIdx, maxMolecules }: OutputOptions
): ParsedInputData => {
    const endIndex = startIdx + maxMolecules;
    const smilesList = parseQuery(query, delimiter, smilesCol, hasHeader).slice(startIdx, endIndex);
    const nameList = parseQuery(query, delimiter, nameCol, hasHeader)
        .slice(startIdx, endIndex)
        .map((name, index) => name || `${index}`);
    return { smilesList, nameList };
};

export async function fetchScaffolds(data: ParsedInputData, maxRings: number, database: string) {
    const apiUrl = import.meta.env.VITE_API_FETCH_SCAFFOLDS_URL;
    try {
        const response = await axios.get(apiUrl, {
            params: {
                SMILES: data.smilesList.join(','),
                Names: data.nameList.join(','),
                max_rings: maxRings,
                database: database
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching scaffolds:", error);
        return [];
    }
}

// related to getting drug details
export async function fetchDrugDetails(scaffoldID: number) {
    // Note: this assumes database === "badapple2" (DB2_NAME), as this is currently the only DB compatible with this API call
    const apiUrl = import.meta.env.VITE_API_FETCH_DRUGS_URL;
    try {
        const response = await axios.get(apiUrl, {
            params: {
                scafid: scaffoldID
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching drug details:", error);
        return [];
    }
}


// related to getting (active) target details
export async function fetchActiveTargetDetails(scaffoldID: number) {
    // Note: this assumes database === "badapple2" (DB2_NAME), as this is currently the only DB compatible with this API call
    const apiUrl = import.meta.env.VITE_API_FETCH_TARGETS_URL;
    try {
        const response = await axios.get(apiUrl, {
            params: {
                scafid: scaffoldID
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching active target details:", error);
        return [];
    }
}