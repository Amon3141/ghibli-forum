import { FaTrashAlt } from "react-icons/fa";

interface TrashButtonProps {
  onClick: () => void;
}

export default function TrashButton({ onClick: handleClickTrashButton }: TrashButtonProps) {
  return (
    <button onClick={handleClickTrashButton}>
      <FaTrashAlt />
    </button>
  );
}