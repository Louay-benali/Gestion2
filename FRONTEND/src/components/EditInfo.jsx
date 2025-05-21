import React from "react";
import { IoCloseOutline } from "react-icons/io5";

const EditInfo = ({ userInfo, addressInfo, onChange, onClose, onSave }) => {
    return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-8 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Edit Profile Information
            </h2>
            <p className="text-sm text-gray-500">
              Update your personal and address details.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <IoCloseOutline />
          </button>
        </div>

        {/* Personal Info Fields */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Personal Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["firstName", "lastName", "email", "phone", "bio"].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-600 capitalize">
                  {field}
                </label>
                <input
                  type="text"
                  name={field}
                  value={userInfo[field]}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            ))}
          </div>

          {/* Address Info Fields */}
          <h3 className="font-medium text-gray-700 pt-6">Address Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Country", "City", "PostalCode", "Id"].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-600">{field}</label>
                <input
                  type="text"
                  name={field}
                  value={addressInfo[field]}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInfo;
