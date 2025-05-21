import React, { useState } from "react";
import { Camera } from "lucide-react";

const Profile = ({ Name, Bio, City }) => {
  const [imageUrl, setImageUrl] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="p-5 mb-6 border border-gray-300 bg-white rounded-2xl dark:border-gray-300 lg:p-6 font-style">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full group">
            {imageUrl ? (
              <img src={imageUrl} alt="user" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Camera size={24} className="text-gray-400" />
              </div>
            )}
            <label htmlFor="image-upload" className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all duration-200">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-xl font-bold text-gray-800">+</span>
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 xl:text-left">
              {Name}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500">
                {Bio}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 xl:block"></div>
              <p className="text-sm text-gray-500">
                {City}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;