import { FulfillmentStatus } from "@/types/politicalParties";

interface StatusBadgeProps {
  status: FulfillmentStatus;
  statusText: string;
}

export const StatusBadge = ({ status, statusText }: StatusBadgeProps) => {
  const statusStyles = {
    "Supporting Evidence": "bg-green-100 text-green-800 border-green-300",
    "Contradictory Evidence": "bg-red-100 text-red-800 border-red-300",
    "Partial/Indirect Evidence": "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  const statusIcons = {
    "Supporting Evidence": (
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        ></path>
      </svg>
    ),
    "Contradictory Evidence": (
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        ></path>
      </svg>
    ),
    "Partial/Indirect Evidence": (
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9V5h2v4h4v2h-4v4H9v-4H5V9h4z" clipRule="evenodd"></path>
      </svg>
    ),
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
      {statusIcons[status]}
      {statusText}
    </span>
  );
};
