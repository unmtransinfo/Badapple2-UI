import { ChangeEventHandler } from "react";

interface CheckboxProps {
  name: string;
  id: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, id, checked, onChange }) => {
  return (
    <input
      type="checkbox"
      name={name}
      id={id}
      checked={checked}
      onChange={onChange}
    />
  );
};

export default Checkbox;
