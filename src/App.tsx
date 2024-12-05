import { useState } from 'react';
import './App.css';
import SiteHeader from "./components/SiteHeader";
import SiteFooter from './components/SiteFooter.tsx';
import ChemPage, { MoleculeInfo } from "./components/ChemPage.tsx";
import SearchResults from "./components/form/SearchResults.tsx";
import { createTheme, ThemeProvider } from "@mui/material";

function App() {
    const [chem, setChem] = useState<{ result: MoleculeInfo[], canGetDrugInfo: boolean, canGetTargetInfo: boolean } | null>(null);
    const theme = createTheme({ palette: { mode: 'dark' } });
    return (
        <ThemeProvider theme={theme}>
            <div className="page-wrapper">
                <div className="page-container">
                    <SiteHeader />
                    {!!chem ? (
                        <ChemPage result={chem.result} setChem={setChem} canGetDrugInfo={chem.canGetDrugInfo} canGetTargetInfo={chem.canGetTargetInfo}/>
                    ) : (
                        <>
                            <SearchResults setChem={setChem} />
                            <SiteFooter />
                        </>
                    )}
                </div>
            </div>
        </ThemeProvider>
    );
}

export default App;
