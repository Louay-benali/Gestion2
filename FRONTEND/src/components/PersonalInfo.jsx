import React from "react";
import { MdOutlineModeEdit } from "react-icons/md";

const PersonalInfo = ({ firstName, lastName, email, phone, bio, role, onEdit }) => {
  const Labels = {
    personelInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone",
    bio: "Biography",
    role: "Role",
  };

  return (
    <div className="p-5 mb-6 border border-gray-300 rounded-2xl bg-white lg:p-6 font-style">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Partie Informations */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 lg:mb-6">
            {Labels.personelInfo}
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">
                {Labels.firstName}
              </p>
              <p className="text-sm font-medium text-gray-800">{firstName}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">
                {Labels.lastName}
              </p>
              <p className="text-sm font-medium text-gray-800">{lastName}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">
                {Labels.email}
              </p>
              <p className="text-sm font-medium text-gray-800">{email}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">
                {Labels.phone}
              </p>
              <p className="text-sm font-medium text-gray-800">{phone}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500">
                {Labels.role}
              </p>
              <p className="text-sm font-medium text-gray-800">{role}</p>
            </div>

            {bio && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500">
                  {Labels.bio}
                </p>
                <p className="text-sm font-medium text-gray-800">{bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bouton Edit */}
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

export default PersonalInfo;
