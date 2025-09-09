import { faCircleNotch, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { fetchScaffolds, parseInputData } from "../../api";
import { Button } from "../common";
import InputOptionsTable, { InputOptions } from "./InputOptions";
import OutputOptionsTable, { OutputOptions } from "./OutputOptions";
import "./SearchResults.css";

interface SearchResultsProps {
  setChem: (chem: any) => void;
}

const DEFAULT_INPUT_OPTIONS: InputOptions = {
  format: "SMILES",
  delimiter: " ",
  smilesCol: 0,
  nameCol: 1,
  hasHeader: false,
};

const DEFAULT_OUTPUT_OPTIONS: OutputOptions = {
  startIdx: 0,
  maxMolecules: 10,
  maxRings: 5,
  database: import.meta.env.VITE_DB2_NAME,
};

const MAX_INPUT_SIZE = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_FILE_EXTENSIONS = [".txt", ".smi", ".tsv", ".csv", ".smiles"];

const EXAMPLE_SMILES = `CCCc1nc-2c(=O)n(c(=O)nc2n(n1)C)C mol1
C[C@]12CC(=O)[C@H]3[C@H]([C@@H]1CC[C@@]2(C(=O)CO)O)CCC4=CC(=O)C=C[C@]34C mol2
c1ccc2c(c1)c(=O)n(s2)c3ccccc3C(=O)N4CCCC4 mol3
COc1ccc2c3c([nH]c2c1)C(C)=NCC3 mol4
Cc1cc(nc(n1)N=C(N)Nc2cccc(c2)N)C mol5
CCc1c(c2ccccc2o1)C(=O)c3cc(c(c(c3)Br)O)Br mol6
OC(=O)C1=C2CCCC(C=C3C=CC(=O)C=C3)=C2NC2=CC=CC=C12 mol7
c1ccc2c(c1)C(=O)c3ccoc3C2=O mol8
O=C(O)CCC(=O)N1CCCC1C(=O)O mol9
O=C([O-])c1cc(=O)c2c(OCC(O)COc3cccc4oc(C(=O)[O-])cc(=O)c34)cccc2o1 mol10`;

const SearchResults: React.FC<SearchResultsProps> = ({ setChem }) => {
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputOptions, setInputOptions] = useState<InputOptions>(
    DEFAULT_INPUT_OPTIONS
  );
  const [outputOptions, setOutputOptions] = useState<OutputOptions>(
    DEFAULT_OUTPUT_OPTIONS
  );

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (event.target) {
      event.target.value = "";
    }

    if (!file) return;

    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!SUPPORTED_FILE_EXTENSIONS.includes(fileExtension)) {
      alert(
        `Unsupported file type. Please upload: ${SUPPORTED_FILE_EXTENSIONS.join(
          ", "
        )}`
      );
      return;
    }

    if (file.size > MAX_INPUT_SIZE) {
      alert("File size exceeds the 5 MB limit. Please upload a smaller file.");
      return;
    }

    try {
      const text = await file.text();
      setSearchInput(text);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading the selected file.");
    }
  };

  const handleSubmit = async () => {
    if (!searchInput || isLoading) return;

    setIsLoading(true);
    try {
      const parsedData = parseInputData(
        searchInput,
        inputOptions,
        outputOptions
      );
      if (parsedData.smilesList.length === 0) {
        alert(
          "No input molecules were provided, please check input and specs (you may want to look at 'Start Index')."
        );
        return;
      }
      // at time of writing only badapple2 has specific drug and target info
      const canGetDrugInfo =
        outputOptions.database === import.meta.env.VITE_DB2_NAME;
      const canGetActiveAssayInfo =
        outputOptions.database === import.meta.env.VITE_DB2_NAME;
      const data = await fetchScaffolds(
        parsedData,
        outputOptions.maxRings,
        outputOptions.database
      );
      if (data) {
        setChem({
          result: data,
          canGetDrugInfo: canGetDrugInfo,
          canGetActiveAssayInfo: canGetActiveAssayInfo,
        });
      }
    } catch (error) {
      console.error("Error processing submission:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOption = <T extends Record<string, any>>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    key: keyof T,
    value: any
  ) => {
    setter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <section
        className={`glass-container gap-0 p-0 ${isLoading ? "active" : ""}`}
      >
        {isLoading && (
          <div className="loader active">
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="text-primary animate-spin fa-2x"
            />
          </div>
        )}
      </section>
      <section className="mb-2">
        <div className="flex mb-2 gap-2">
          <Button
            variant="success"
            icon={faUpload}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept={SUPPORTED_FILE_EXTENSIONS.join(",")}
            className="hidden"
          />

          <Button variant="danger" onClick={() => setSearchInput("")}>
            Clear Input
          </Button>

          <Button
            variant="primary"
            onClick={() => setSearchInput(EXAMPLE_SMILES)}
          >
            Example Input
          </Button>
        </div>
        <div className="flex-container">
          <textarea
            placeholder="Enter SMILES (Press Enter for new line)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPaste={(e) => {
              if (
                e.clipboardData.getData("text").length + searchInput.length >
                MAX_INPUT_SIZE
              ) {
                e.preventDefault();
                alert("Pasting this content would exceed the 5 MB limit.");
              }
            }}
            maxLength={5000000}
            className="w-full h-60 p-2 mb-4 border dark:border-gray-600/40 backdrop-blur-md dark:bg-gray-600/30 dark:hover:bg-gray-600/50 dark:focus:bg-gray-600/50 dark:active:bg-gray-600/50 resize-y"
            style={{ minWidth: "20rem", width: "30rem" }}
          />
          <InputOptionsTable
            inputOptions={inputOptions}
            updateInputOptions={(key, value) =>
              updateOption(setInputOptions, key, value)
            }
          />
          <OutputOptionsTable
            outputOptions={outputOptions}
            updateOutputOptions={(key, value) =>
              updateOption(setOutputOptions, key, value)
            }
          />
        </div>
      </section>
      <Button
        onClick={handleSubmit}
        variant="primary"
        fullWidth
        className="mt-2"
      >
        Submit
      </Button>
    </div>
  );
};

export default SearchResults;
