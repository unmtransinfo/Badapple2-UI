import { ChangeEventHandler, useId } from "react";

interface SelectInputProps {
  name: string;
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  optionValues: string[];
  optionNames: string[];
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  id,
  value,
  onChange,
  optionValues,
  optionNames,
}) => {
  return (
    <select name={name} id={id} key={id} value={value} onChange={onChange}>
      {optionValues.map((o, index) => (
        <option key={useId()} value={o}>
          {optionNames[index]}
        </option>
      ))}
    </select>
  );
};

export default SelectInput;
