import React from "react";
import { MdOutlineModeEdit } from "react-icons/md";

const Address = ({ PostalCode, Country, City, Id, Address, onEdit }) => {
  const Labels = {
    address: "Address",
    fullAddress: "Full Address",
    country: "Country",
    postalCode: "Postal Code",
    city: "City/State",
    Id: "User ID",
  };

  return (
    <div className="p-5 border border-gray-300 rounded-2xl bg-white lg:p-6 font-style">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Address Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 lg:mb-6">
            {Labels.address}
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs text-gray-500">{Labels.fullAddress}</p>
              <p className="text-sm font-medium text-gray-800">{Address || "Non spécifié"}</p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500">{Labels.country}</p>
              <p className="text-sm font-medium text-gray-800">{Country}</p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500">{Labels.city}</p>
              <p className="text-sm font-medium text-gray-800">{City || "Non spécifié"}</p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500">{Labels.Id}</p>
              <p className="text-sm font-medium text-gray-800">{Id || "Non spécifié"}</p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="border dark:border-gray-300 p-2 justify-center rounded-4xl sm:w-24 flex flex-row gap-2 items-center hover:bg-gray-50"
        >
          <MdOutlineModeEdit />
          Edit
        </button>
      </div>
    </div>
  );
};

export default Address;
