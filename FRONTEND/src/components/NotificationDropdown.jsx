import React from "react";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { BiBell } from "react-icons/bi";
import { IoTimeOutline } from "react-icons/io5";

const NotificationDropdown = () => {
  return (
    <div className="absolute right-0 mt-2 w-[320px] rounded-xl bg-white shadow-lg border border-gray-100 z-50">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <h5 className="text-[14px] font-medium text-gray-900">Notifications</h5>
        <p className="text-[14px] text-gray-500">You have 2 unread messages</p>
      </div>

      {/* Notifications List */}
      <div className="p-2 bg-white">
        {/* New Notification */}
        <div className="w-full flex items-start px-3 py-2 hover:bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 mt-1">
            <IoCheckmarkDoneCircleOutline className="w-5 h-5 text-green-500" />
          </div>
          <div className="ml-3">
            <p className="text-[14px] text-gray-700">
              <span className="font-medium">Maintenance completed</span>
            </p>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Equipment #123 maintenance has been completed
            </p>
            <p className="text-[12px] text-gray-400 mt-1">2 min ago</p>
          </div>
        </div>

        {/* Earlier Notification */}
        <div className="w-full flex items-start px-3 py-2 hover:bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 mt-1">
            <IoTimeOutline className="w-5 h-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-[14px] text-gray-700">
              <span className="font-medium">Maintenance scheduled</span>
            </p>
            <p className="text-[13px] text-gray-500 mt-0.5">
              New maintenance task scheduled for tomorrow
            </p>
            <p className="text-[12px] text-gray-400 mt-1">1 hour ago</p>
          </div>
        </div>
      </div>

      {/* View All Section */}
      <div className="p-2 border-t border-gray-100 bg-white rounded-b-xl">
        <button className="w-full flex items-center justify-center px-3 py-2 text-[14px] text-indigo-600 hover:bg-gray-50 rounded-lg font-medium">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
