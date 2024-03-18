'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';


const TasteList = () => {
  const [taste, setTastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaste, setNewTaste] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [selectedTaste, setSelectedTaste] = useState(null);
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
    const fetchTastes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/taste/tastes');
        setTastes(response.data);
      } catch (error) {
        console.error('Error fetching tastes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTastes();
  }, []);

  const handleEditClick = (taste) => {
    setSelectedTaste(taste);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (taste) => {
    setSelectedTaste(taste);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Check if updated taste is empty
    if (!selectedTaste.taste.trim()) {
      setErrorMessage('Updated taste cannot be empty.');
      setErrorModalOpen(true);
      // Automatically close the error modal after 2 seconds
      setTimeout(() => {
        setErrorModalOpen(false);
        setErrorMessage('');
      }, 2000);
      return;
    }

    try {
      // Make an API request using Axios to update the taste
      await axios.patch(`http://localhost:5000/api/taste/tastes/${selectedTaste._id}`, {
        taste: selectedTaste.taste,
      });

      // Fetch the updated list of tastes
      const response = await axios.get('http://localhost:5000/api/taste/tastes');
      setTastes(response.data);

      // Close the edit modal
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating taste:', error);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      // Make an API request using Axios to delete the taste
      await axios.delete(`http://localhost:5000/api/taste/tastes/${selectedTaste._id}`);

      // Remove the deleted taste from the local state
      setTastes((prevTastes) => prevTastes.filter((taste) => taste._id !== selectedTaste._id));

      // Close the delete modal
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting taste:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if newTaste is empty
    // if (!newTaste.trim()) {
    //   setErrorMessage('Taste field cannot be empty !');
    //   setErrorModalOpen(true);
    //   // Automatically close the error modal after 2 seconds
    //   setTimeout(() => {
    //     setErrorModalOpen(false);
    //     setErrorMessage('');
    //   }, 2000);
    //   return;
    // }

    try {
      // Make an API request using Axios to post the new taste
      await axios.post('http://localhost:5000/api/taste/tastes', { taste: newTaste });

      // Fetch the updated list of tastes
      const response = await axios.get('http://localhost:5000/api/taste/tastes');
      setTastes(response.data);

      // Reset the new taste input field
      setNewTaste('');

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

      <div className="max-w-5xl mx-auto bg-white p-4 rounded-lg shadow-md mt-12 lg:mt-28 font-sans">
        <h1 className="text-xl font-bold font-sans md:mb-0 text-orange-500">Taste Master</h1>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4 mt-4">
            <label htmlFor="newTaste" className="block text-sm font-bold text-gray-600">
              Add Taste / Specification
            </label>
            <input
              type="text"
              id="newTaste"
              name="newTaste"
              value={newTaste}
              onChange={(e) => setNewTaste(e.target.value)}
              className="mt-1 p-1 border rounded-md  focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div className="col-span-2 flex justify-center mt-1">
            <button
              type="submit"
              className=" bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full lg:w-60 mx-auto"            >
              Add Taste
            </button>
          </div>
        </form>

        {isSuccessPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <h4 className="text-xl font-bold mb-4 text-green-600">Taste Added Successfully!</h4>
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
            <table className=" min-w-full  border-gray-300">
              <thead className="text-base bg-zinc-100 text-yellow-700 border">
                <tr>
                  <th className="p-2 text-left text-gray lg:pl-40 pl-4">SR No.</th>
                  <th className="p-2 text-left text-gray lg:pl-40 pl-4">Taste</th>
                  <th className="p-2 text-center text-gray lg:pl-32">Actions</th>
                </tr>
              </thead>
              <tbody className="text-md font-sans font-semibold text-sm">
                {taste.map((taste, index) => (
                  <tr key={taste._id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}
                  >
                    <td className=" p-1 text-left text-gray lg:pl-40 pl-4">{index + 1}</td>
                    <td className=" p-1 text-left text-gray lg:pl-40 pl-4">{taste.taste}</td>
                    <td className="pl-2 p-1 text-center text-gray lg:pl-32">
                      <button
                        className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() => handleEditClick(taste)}
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          color="orange"
                          className="cursor-pointer"
                        />{" "}
                      </button>
                      <button
                        className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() => handleDeleteClick(taste)}
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
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg w-96">
              <button
                type="button"
                className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
                onClick={() => setIsEditModalOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
              <h1 className="text-xl font-bold mb-4">Edit Taste</h1>
              <form onSubmit={handleEditSubmit} className="mb-4">
                <div className="mb-1">
                  <label htmlFor="editTaste" className="block text-sm font-medium text-gray-600">
                    Taste:
                  </label>
                  <input
                    type="text"
                    id="editTaste"
                    name="editTaste"
                    value={selectedTaste.taste}
                    onChange={(e) => setSelectedTaste({ ...selectedTaste, taste: e.target.value })}
                    className="p-2 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <div className="flex justify-center mt-3">
                  <button
                    type="submit"
                    className=" bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full mt-3 lg:w-60 mx-auto"
                  >
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
                Do you want to delete this taste?</p>
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



export default TasteList;