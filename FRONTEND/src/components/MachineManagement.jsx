import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import {
  MdEdit,
  MdDeleteForever,
  MdSettingsApplications,
} from "react-icons/md";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MachineManagement = () => {
  // State for machines data
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalMachines: 0,
  });

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Current machine being edited/deleted
  const [currentMachine, setCurrentMachine] = useState(null);

  // New machine form data
  const [formData, setFormData] = useState({
    nomMachine: "",
    dataSheet: "",
    etat: "Fonctionnelle",
  });

  // Available machine statuses
  const statuses = ["Fonctionnelle", "En panne", "Maintenance"];

  // Fetch machines from backend
  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/machine?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      const data = await response.json();

      setMachines(data.results);
      setPagination({
        ...pagination,
        totalPages: data.totalPages || 1,
        totalMachines: data.totalMachines || 0,
      });

      setError(null);
    } catch (err) {
      setError(`Erreur de chargement des données: ${err.message}`);
      console.error("Failed to fetch machines:", err);
      toast.error("Erreur lors du chargement des machines");
    } finally {
      setLoading(false);
    }
  };

  // Load machines on component mount and when pagination changes
  useEffect(() => {
    fetchMachines();
  }, [pagination.page, pagination.limit]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle current machine input changes
  const handleCurrentMachineChange = (e) => {
    const { name, value } = e.target;
    setCurrentMachine({
      ...currentMachine,
      [name]: value,
    });
  };

  // Add a new machine
  const handleAddMachine = async () => {
    try {
      const response = await fetch("http://localhost:3001/machine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nomMachine: formData.nomMachine,
          dataSheet: formData.dataSheet,
          etat: formData.etat
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Reset form
      setFormData({
        nomMachine: "",
        dataSheet: "",
        etat: "Fonctionnelle",
      });
      
      setIsAddModalOpen(false);
      toast.success("Machine ajoutée avec succès");
      fetchMachines();
    } catch (err) {
      console.error("Failed to add machine:", err);
      toast.error(`Erreur lors de l'ajout: ${err.message}`);
    }
  };

  // Update existing machine
  const handleUpdateMachine = async () => {
    try {
      const response = await fetch(`http://localhost:3001/machine/${currentMachine._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nomMachine: currentMachine.nomMachine,
          datasheet: currentMachine.dataSheet,
          etat: currentMachine.etat
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      setIsEditModalOpen(false);
      toast.success("Machine mise à jour avec succès");
      fetchMachines();
    } catch (err) {
      console.error("Failed to update machine:", err);
      toast.error(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  // Delete machine
  const handleDeleteMachine = async () => {
    try {
      const response = await fetch(`http://localhost:3001/machine/${currentMachine._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      setIsDeleteModalOpen(false);
      toast.success("Machine supprimée avec succès");
      fetchMachines();
    } catch (err) {
      console.error("Failed to delete machine:", err);
      toast.error(`Erreur lors de la suppression: ${err.message}`);
    }
  };

  // Update machine settings (status)
  const handleUpdateSettings = async () => {
    try {
      const response = await fetch(`http://localhost:3001/machine/${currentMachine._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          nomMachine: currentMachine.nomMachine,
          datasheet: currentMachine.dataSheet,
          etat: currentMachine.etat
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      setIsSettingsModalOpen(false);
      toast.success("Paramètres mis à jour avec succès");
      fetchMachines();
    } catch (err) {
      console.error("Failed to update settings:", err);
      toast.error(`Erreur lors de la mise à jour des paramètres: ${err.message}`);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Fonctionnelle":
        return "bg-green-100 text-green-800";
      case "En panne":
        return "bg-red-100 text-red-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-gray-300">
        <h2 className="text-xl font-semibold">Machine Management</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => setIsAddModalOpen(true)}
        >
          <IoMdAdd className="mr-1" /> Add Machine
        </button>
      </div>

      {/* Display error message if there is an error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-b border-red-100">
          <p>{error}</p>
        </div>
      )}

      {/* Show loading state */}
      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <div className="text-gray-500">Loading machines...</div>
        </div>
      ) : (
        <>
          {/* Machines Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datasheet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {machines.map((machine) => (
                  <tr key={machine._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-200 rounded-md">
                          <MdSettingsApplications
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {machine.nomMachine}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {machine.dataSheet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          machine.etat
                        )}`}
                      >
                        {machine.etat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-gray-600 hover:text-blue-900"
                          onClick={() => {
                            setCurrentMachine(machine);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            setCurrentMachine(machine);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <MdDeleteForever size={20} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => {
                            setCurrentMachine(machine);
                            setIsSettingsModalOpen(true);
                          }}
                        >
                          <MdSettingsApplications size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.totalPages || 1}
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                disabled={pagination.page <= 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Machine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Machine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Name
                </label>
                <input
                  type="text"
                  name="nomMachine"
                  value={formData.nomMachine}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Machine 01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datasheet
                </label>
                <input
                  type="text"
                  name="dataSheet"
                  value={formData.dataSheet}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SN-XXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="etat"
                  value={formData.etat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleAddMachine}
              >
                Add Machine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Machine Modal */}
      {isEditModalOpen && currentMachine && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Machine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Name
                </label>
                <input
                  type="text"
                  name="nomMachine"
                  value={currentMachine.nomMachine}
                  onChange={handleCurrentMachineChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datasheet
                </label>
                <input
                  type="text"
                  name="dataSheet"
                  value={currentMachine.dataSheet}
                  onChange={handleCurrentMachineChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="etat"
                  value={currentMachine.etat}
                  onChange={handleCurrentMachineChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleUpdateMachine}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Machine Modal */}
      {isDeleteModalOpen && currentMachine && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Machine</h3>
            <p className="text-gray-700">
              Are you sure you want to delete the machine{" "}
              <strong>{currentMachine.nomMachine}</strong>? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteMachine}
              >
                Delete Machine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Machine Settings Modal */}
      {isSettingsModalOpen && currentMachine && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Machine Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine
                </label>
                <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                  <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-gray-200 rounded-md">
                    <MdSettingsApplications
                      size={20}
                      className="text-gray-600"
                    />
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">
                      {currentMachine.nomMachine}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentMachine.dataSheet}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="etat"
                  value={currentMachine.etat}
                  onChange={handleCurrentMachineChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Log
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24"
                  placeholder="Enter maintenance notes here..."
                  disabled={true}
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsSettingsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleUpdateSettings}
              >
                Update Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default MachineManagement;
