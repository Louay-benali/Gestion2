import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { enUS } from "date-fns/locale";
import Cookies from "js-cookie";
import { toast, Bounce } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/AuthForm/Loader";

// Custom CSS to override default styles
const customCalendarStyles = `
  .rbc-calendar {
    border: none;
  }
  .rbc-header {
    padding: 12px 0;
    font-weight: 500;
    color: #6B7280;
    text-transform: uppercase;
    font-size: 0.875rem;
    border-bottom: 1px solid #E5E7EB;
  }
  .rbc-month-view {
    border: 1px solid #E5E7EB;
    border-radius: 8px;
  } 
  .rbc-day-bg {
    border-right: 1px solid #E5E7EB;
    border-bottom: 1px solid #E5E7EB;
  }
  .rbc-date-cell {
    padding: 8px;
    text-align: left;
    font-weight: normal;
    font-size: 0.95rem;
    color: #111827;
  }
  .rbc-off-range-bg {
    background-color: #F9FAFB;
  }
  .rbc-off-range {
    color: #9CA3AF;
  }
  .rbc-today {
    background-color: white !important;
  }
  .rbc-row-segment {
    padding: 0 2px;
  }
  .rbc-event {
    border-radius: 4px;
    padding: 1px 3px;
    min-height: auto;
    font-size: 0.7rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 1px;
  }
  .rbc-event-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    line-height: 1.2;
  }
  .rbc-event.rbc-selected {
    background-color: inherit;
    box-shadow: 0 0 0 1px #3182ce;
  }
  .rbc-day-slot .rbc-event {
    border: none;
  }
  .rbc-show-more {
    font-size: 0.7rem;
    font-weight: 500;
    color: #4B5563;
    background-color: transparent;
  }
`;

// Add the styles to the document
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = customCalendarStyles;
  document.head.appendChild(styleEl);
}

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  // Add state for current date - set to May 2025 to match screenshot
  const [currentDate, setCurrentDate] = useState(new Date());
  // Events state for interventions
  const [events, setEvents] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: null,
    title: "",
    start: "",
    end: "",
    type: "primary",
    interventionId: "",
  });

  // Add state for intervention ID
  const [selectedIntervention, setSelectedIntervention] = useState("");

  // Fetch interventions from the backend
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/intervention", {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        });

        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }

        const data = await response.json();
        
        // Process the data to match our component's needs
        const processedData = data.results.map((intervention) => ({
          id: intervention._id,
          machineNom: intervention.machine?.nomMachine || "N/A",
          technicienNom: intervention.technicien
            ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
            : "N/A",
          type: intervention.type,
          status: intervention.status,
          scheduledDate: intervention.scheduledDate,
        }));
        
        // Convert interventions with scheduledDate to calendar events
        const calendarEvents = processedData
          .filter(intervention => intervention.scheduledDate)
          .map(intervention => {
            const scheduledDate = new Date(intervention.scheduledDate);
            // End date is 1 hour after start date for display purposes
            const endDate = new Date(scheduledDate);
            endDate.setHours(endDate.getHours() + 1);
            
            return {
              id: intervention.id,
              title: `${intervention.type} - ${intervention.machineNom}`,
              start: scheduledDate,
              end: endDate,
              type: intervention.type === "Maintenance" ? "primary" : "danger",
              resource: intervention,
            };
          });
        
        setEvents(calendarEvents);
        setLoading(false);
    
      } catch (error) {
        console.error("Failed to fetch interventions:", error);
        setLoading(false);
       
      }
    };

    fetchInterventions();
  }, []);

  // Fetch technicians and machines for the form
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch technicians
        const techResponse = await fetch("http://localhost:3001/user", {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        });

        if (techResponse.ok) {
          // Remove unused variable assignment
          // const techData = await techResponse.json();
          // const techniciansList = techData.filter(user => user.role === "technicien");
          // setTechniciens(techniciansList);
          await techResponse.json(); // Still parse the response but don't assign to a variable
        }

        // Fetch machines
        const machineResponse = await fetch("http://localhost:3001/machine", {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          withCredentials: true,
        });

        if (machineResponse.ok) {
          // Remove unused variable assignment
          // const machineData = await machineResponse.json();
          // setMachines(machineData.results);
          await machineResponse.json(); // Still parse the response but don't assign to a variable
        }
      } catch (err) {
        console.error("Failed to fetch reference data:", err);
      }
    };

    fetchReferenceData();
  }, []);

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: "",
      borderLeft: "",
      borderRadius: "3px",
      color: "",
      border: "",
      padding: "1px 2px",
      fontSize: "0.7rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
    };

    switch (event.type) {
      case "danger":
        style.backgroundColor = "#fef2f2";
        style.borderLeft = "2px solid #dc2626";
        style.color = "#991b1b";
        break;
      case "success":
        style.backgroundColor = "#f0fdf4";
        style.borderLeft = "2px solid #16a34a";
        style.color = "#166534";
        break;
      case "primary":
        style.backgroundColor = "#eff6ff";
        style.borderLeft = "2px solid #2563eb";
        style.color = "#1e40af";
        break;
      case "warning":
        style.backgroundColor = "#fff7ed";
        style.borderLeft = "2px solid #f97316";
        style.color = "#c2410c";
        break;
      default:
        style.backgroundColor = "#f3f4f6";
    }

    return {
      style: style,
    };
  };

  // Custom Toolbar Component with centered title and button on the right
  const CustomToolbar = ({ label, onNavigate }) => {
    const handleNavigate = (action) => {
      onNavigate(action);
    };

    return (
      <div className="mb-4 flex justify-between items-center px-2 py-2">
        <div className="flex items-center gap-2">
          <button
            className="bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={() => handleNavigate("PREV")}
          >
            ‹
          </button>
          <button
            className="bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={() => handleNavigate("NEXT")}
          >
            ›
          </button>
        </div>

        <div className="text-center flex-grow">
          <span className="text-lg font-medium text-gray-800">{label}</span>
        </div>

        <div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => {
              setNewEvent({
                id: events.length + 1,
                title: "",
                start: "",
                end: "",
                type: "primary",
                interventionId: "",
              });
              setShowModal(true);
            }}
          >
            Planifier Intervention +
          </button>
        </div>
      </div>
    );
  };

  // Custom Event Component
  const CustomEvent = ({ event }) => {
    // Extract machine name from title (format is "Type - MachineName")
    const titleParts = event.title.split(" - ");
    const eventType = titleParts[0];
    const machineName = titleParts[1] || "";
    
    // Determine color based on event type
    const getEventColor = () => {
      if (eventType.toLowerCase() === "réparation") {
        return "text-red-600";
      } else {
        return "text-blue-600";
      }
    };

    return (
      <div className="p-0 text-xs">
        <div className={`flex items-center font-medium ${getEventColor()}`}>
          {eventType.toLowerCase() === "réparation" ? 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            :
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
          <span className="truncate">{machineName}</span>
        </div>
        {event.start.getHours() > 0 && (
          <div className="text-xs opacity-75 pl-4">
            {format(event.start, "HH:mm")}
          </div>
        )}
      </div>
    );
  };

  // Handle event form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!selectedIntervention || !newEvent.start) {
      toast.error("Veuillez entrer l'ID de l'intervention et une date", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    try {
      setLoading(true);
      // Format the date for the API
      const scheduledDate = new Date(newEvent.start);
      
      // Call the API to schedule the intervention
      const response = await fetch("http://localhost:3001/intervention/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          interventionId: selectedIntervention,
          scheduledDate: scheduledDate.toISOString(),
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      // Parse the response but don't assign to a variable
      await response.json();
      
      // Add the new event to the calendar
      // First, get the intervention details
      const interventionResponse = await fetch(`http://localhost:3001/intervention/${selectedIntervention}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        withCredentials: true,
      });
      
      if (!interventionResponse.ok) {
        throw new Error(`API response error: ${interventionResponse.status}`);
      }
      
      const interventionData = await interventionResponse.json();
      
      // Create the calendar event
      const machineNom = interventionData.machine?.nomMachine || "N/A";
      const technicienNom = interventionData.technicien
        ? `${interventionData.technicien.prenom} ${interventionData.technicien.nom}`
        : "N/A";
      
      const endDate = new Date(scheduledDate);
      endDate.setHours(endDate.getHours() + 1);
      
      const newCalendarEvent = {
        id: selectedIntervention,
        title: `${interventionData.type} - ${machineNom}`,
        start: scheduledDate,
        end: endDate,
        type: interventionData.type === "Maintenance" ? "primary" : "danger",
        resource: {
          id: selectedIntervention,
          machineNom,
          technicienNom,
          type: interventionData.type,
          status: interventionData.status,
          scheduledDate: scheduledDate,
        },
      };
      
      setEvents([...events, newCalendarEvent]);

      // Close modal and reset form
      setShowModal(false);
      setNewEvent({
        id: null,
        title: "",
        start: "",
        end: "",
        type: "primary",
        interventionId: "",
      });
      setSelectedIntervention("");
      
      toast.success("Intervention planifiée avec succès", {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Failed to schedule intervention:", error);
      toast.error(`Erreur lors de la planification: ${error.message}`, {
        position: "bottom-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="h-screen p-4 bg-white rounded-lg border-gray-200 border">
        <h2 className="text-2xl font-medium text-gray-800 mb-4 pl-2">Calendrier des Interventions</h2>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          defaultView="month"
          components={{
            toolbar: CustomToolbar,
            event: CustomEvent,
          }}
          eventPropGetter={eventStyleGetter}
          style={{
            height: "85vh",
            fontFamily: "system-ui, sans-serif",
          }}
          formats={{
            monthHeaderFormat: "MMMM yyyy",
          }}
          dayPropGetter={() => ({
            style: {
              backgroundColor: "white",
              height: "120px",
            },
          })}
        />

        {/* Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Planifier une Intervention
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Définir une date pour l'intervention sélectionnée
              </p>

              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    ID d'intervention
                  </label>
                  <input
                    type="text"
                    value={selectedIntervention}
                    onChange={(e) => setSelectedIntervention(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez l'ID de l'intervention"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Type d'intervention
                  </label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="eventType"
                        value="danger"
                        checked={newEvent.type === "danger"}
                        onChange={() =>
                          setNewEvent({ ...newEvent, type: "danger" })
                        }
                        className="mr-2"
                      />
                      <span>Réparation</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="eventType"
                        value="primary"
                        checked={newEvent.type === "primary"}
                        onChange={() =>
                          setNewEvent({ ...newEvent, type: "primary" })
                        }
                        className="mr-2"
                      />
                      <span>Maintenance</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Date d'intervention
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={newEvent.start}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, start: e.target.value })
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={`px-6 py-3 rounded-lg text-white focus:outline-none ${
                      loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={loading || !selectedIntervention || !newEvent.start}
                  >
                    {loading ? "Traitement..." : "Planifier"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ToastContainer />
      </div>
    </>
  );
};

export default Calendar;