'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';

const UnitList = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newUnit, setNewUnit] = useState('');
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter()

  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);


  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/unit/units');
        setUnits(response.data);
      } catch (error) {
        console.error('Error fetching units:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const handleEditClick = (unit) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (unit) => {
    setSelectedUnit(unit);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (e, updatedUnit) => {
    e.preventDefault();

    // Check if updated unit is empty
    if (!updatedUnit.unit.trim()) {
      setErrorMessage('Updated unit cannot be empty.');
      setErrorModalOpen(true);
      // Automatically close the error modal after 2 seconds
      setTimeout(() => {
        setErrorModalOpen(false);
        setErrorMessage('');
      }, 2000);
      return;
    }

    try {
      // Make an API request using Axios to update the unit
      await axios.patch(`http://localhost:5000/api/unit/units/${selectedUnit._id}`, {
        unit: updatedUnit.unit, // Use 'unit' instead of 'updatedUnit.units'
      });

      // Update the local state after a successful edit
      setUnits((prevUnits) =>
        prevUnits.map((unit) => (unit._id === selectedUnit._id ? updatedUnit : unit))
      );
    } catch (error) {
      console.error('Error updating unit:', error);
    } finally {
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/unit/units/${selectedUnit._id}`);
      // Remove the deleted unit from the local state
      setUnits((prevUnits) => prevUnits.filter((unit) => unit._id !== selectedUnit._id));
    } catch (error) {
      console.error('Error deleting unit:', error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if newUnit is empty
    // if (!newUnit.trim()) {
    //   setErrorMessage('Unit cannot be added empty.');
    //   setErrorModalOpen(true);
    //   // Automatically close the error modal after 2 seconds
    //   setTimeout(() => {
    //     setErrorModalOpen(false);
    //     setErrorMessage('');
    //   }, 2000);
    //   return;
    // }

    try {
      // Make an API request using Axios to post the new unit
      await axios.post('http://localhost:5000/api/unit/units', { unit: newUnit });

      // Fetch the updated list of units
      const response = await axios.get('http://localhost:5000/api/unit/units');
      setUnits(response.data);

      // Reset the new unit input field
      setNewUnit('');

      // Open the success popup
      setIsSuccessPopupOpen(true);

      // Close the success popup after a few seconds (e.g., 3 seconds)
      setTimeout(() => {
        setIsSuccessPopupOpen(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error.message);
      // Handle the error as needed
    }
  };


  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto bg-white p-4 rounded-lg shadow-md mt-12 font-sans">
      <h1 className="text-xl font-bold font-sans md:mb-0 text-orange-600">Unit Master</h1>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4 mt-4">
            <label htmlFor="newUnit" className="block text-sm font-medium text-gray-600">
              Add Unit:
            </label>
            <input
              type="text"
              id="newUnit"
              name="newUnit"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              className="mt-1 p-1 border rounded-md  focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div className="col-span-2 flex justify-center mt-1">
            <button
              type="submit"
              className=" bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full w-72 mx-auto"
            >
              Add Unit
            </button>
          </div>
        </form>

        {isSuccessPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black opacity-50"></div>

            {/* Modal Content */}
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Unit Added Successfully!</h2>
            </div>
          </div>
        )}
        {errorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black opacity-50"></div>

            {/* Error Modal Content */}
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg text-center">
              <p className="text-red-600 mb-6">{errorMessage}</p>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto max-h-full">
            <table className="min-w-full ">
              <thead className="text-sm bg-zinc-100 text-yellow-700 border">
                <tr>
                  <th className="p-1 text-left text-gray lg:pl-40 pl-4">Unit</th>
                  <th className="p-1 text-left text-gray lg:pl-96 pl-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-sans font-semibold">
                {units.map((unit, index) => (
                  <tr key={unit._id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}
                  >
                    <td className="p-1 text-left text-gray lg:pl-40 pl-4">{unit.unit}</td>
                    <td className=" pl-2 p-1 text-left text-gray lg:pl-96">
                      <button
                        className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() => handleEditClick(unit)}
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          color="orange"
                          className="cursor-pointer"
                        />{" "}
                      </button>
                      <button
                        className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() => handleDeleteClick(unit)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          color="red"
                          className="cursor-pointer"
                        />{" "}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black opacity-50"></div>

            {/* Modal Content */}
            <div className="relative z-40 bg-white p-6 rounded-md shadow-lg w-96">
              <button
                type="button"
                className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
                onClick={() => setIsEditModalOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
              <h2 className="text-xl font-bold mb-4">Edit Unit</h2>

              {/* Edit Form */}
              <form onSubmit={(e) => handleEditSubmit(e, selectedUnit)} className="mb-4">
                {/* units */}
                <div className="mb-1">
                  <label htmlFor="editUnit" className="block text-sm font-medium text-gray-600">
                    units:
                  </label>
                  <input
                    type="text"
                    id="editUnit"
                    name="editUnit"
                    value={selectedUnit.unit}
                    onChange={(e) => setSelectedUnit({ ...selectedUnit, unit: e.target.value })}
                    className="p-2 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-center mt-1">
                  <button
                    type="submit"
                    className=" bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full mt-3 lg:w-60 mx-auto"                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black opacity-50"></div>

            {/* Modal Content */}
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <p className="text-red-600 font-medium text-lg mb-4">
                Do you want to delete this unit?</p>

              <div className="flex justify-end mt-4">
                {/* Delete Button */}
                <button
                  onClick={handleDeleteSubmit}
                  className=" bg-red-200  hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-full mr-2"
                >
                  Yes
                </button>
                <button
                  className=" bg-slate-300  hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-full "
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};



export default UnitList;

