import { createTheme, ThemeProvider } from "@mui/material";
import { useState } from "react";
import "./App.css";
import ResultsPage, { MoleculeInfo } from "./components/ResultsPage.tsx";
import SiteFooter from "./components/SiteFooter.tsx";
import SiteHeader from "./components/SiteHeader";
import SearchResults from "./components/form/SearchResults.tsx";

function App() {
  const [chem, setChem] = useState<{
    result: MoleculeInfo[];
    canGetDrugInfo: boolean;
    canGetActiveAssayInfo: boolean;
  } | null>(null);
  const theme = createTheme({ palette: { mode: "dark" } });
  return (
    <ThemeProvider theme={theme}>
      <div className="page-wrapper">
        <div className="page-container">
          <SiteHeader />
          {!!chem ? (
            <ResultsPage
              result={chem.result}
              setChem={setChem}
              canGetDrugInfo={chem.canGetDrugInfo}
              canGetActiveAssayInfo={chem.canGetActiveAssayInfo}
            />
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
