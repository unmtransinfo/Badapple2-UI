import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./tooltip.css";

interface ToolTipProps {
  name: string;
  text: string;
}

const ToolTip = ({ name, text }: ToolTipProps) => {
  return (
    <>
      {name}
      <span data-tooltip={text}>
        <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" />
      </span>
    </>
  );
};

export default ToolTip;
