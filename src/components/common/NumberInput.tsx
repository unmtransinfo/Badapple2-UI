import { ChangeEventHandler } from "react";

interface NumberInputProps {
  name: string;
  id: string;
  min: number;
  max: number;
  value: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const NumberInput: React.FC<NumberInputProps> = ({
  name,
  id,
  min,
  max,
  value,
  onChange,
}) => {
  return (
    <input
      type="number"
      name={name}
      id={id}
      min={min}
      size={4}
      max={max}
      value={value}
      onChange={onChange}
    />
  );
};

export default NumberInput;
