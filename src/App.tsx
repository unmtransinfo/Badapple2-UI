import { useState } from 'react';
import './App.css';
import SiteHeader from "./components/SiteHeader";
import ChemPage from "./components/ChemPage.tsx";
import SearchResults from "./components/form/SearchResults.tsx";
import { createTheme, ThemeProvider } from "@mui/material";

function App() {
    const [chem, setChem] = useState();
    const theme = createTheme({ palette: { mode: 'dark' } });
    return (
        <ThemeProvider theme={theme}>
            <div className="page-wrapper">
                <div className="page-container">
                    <SiteHeader />
                    {/* TODO: Refactor to use ReactRouter */}
                    {!!chem ? (
                        <ChemPage result={chem} setChem={setChem} />
                    ) : (
                        <SearchResults setChem={setChem} />
                    )}
                </div>
            </div>
        </ThemeProvider>
    );
}

export default App;
