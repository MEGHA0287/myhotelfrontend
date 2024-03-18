'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faTimes, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

// Function to capitalize the first letter
const capitalizeFirstLetter = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};


const Greetings = () => {
  const [createGreetData, setCreateGreetData] = useState({
    greet: '',
    message: '',
  });
  const [updateGreetData, setUpdateGreetData] = useState({
    id: '',
    greet: '',
    message: '',
  });
  const [deleteGreetId, setDeleteGreetId] = useState('');
  const [greetings, setGreetings] = useState([]);
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null); // New state for the item ID to delete
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [isTimerPopupOpen, setIsTimerPopupOpen] = useState(false); // State to control the timer popup
  const [editedGreet, setEditedGreet] = useState({
    id: '',
    greet: '',
    message: '',
  }); // State for edited greet data
  const [dataAdded, setDataAdded] = useState(false); // Flag to track if data has been added

  useEffect(() => {
    getGreetings();
  }, []);

  const router = useRouter();
  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);

  const getGreetings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/greet/greet');
      setGreetings(response.data);
    } catch (error) {
      console.error('Error retrieving greetings:', error);
    }
  };

  const handleEdit = (greet) => {
    setEditedGreet({
      id: greet._id,
      greet: greet.greet,
      message: greet.message,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    // Trim whitespace from the greet field
    const trimmedGreet = editedGreet.greet.trim();

    // Check if the trimmed greet is empty
    if (trimmedGreet === '') {
      // Show timer popup
      setIsTimerPopupOpen(true);

      // Close the timer popup after 3 seconds
      setTimeout(() => {
        setIsTimerPopupOpen(false);
      }, 3000);

      // Return early if greet is empty
      return;
    }
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/greet/greet/${editedGreet.id}`,
        { greet: editedGreet.greet, message: editedGreet.message }
      );
      const updatedGreet = response.data;
      setGreetings((prevGreetings) =>
        prevGreetings.map((greet) =>
          greet._id === updatedGreet._id ? updatedGreet : greet
        )
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating greet:', error);
    }
  };

  const handleDelete = (itemId) => {
    setItemIdToDelete(itemId);
    setIsDeleteConfirmationModalOpen(true);
  };

  // const handleDeleteConfirmed = async () => {
  //   try {
  //     await axios.delete(`http://localhost:5000/api/greet/greet/${itemIdToDelete}`);
  //     setGreetings((prevGreetings) => prevGreetings.filter((greet) => greet._id !== itemIdToDelete));
  //     setIsDeleteConfirmationModalOpen(false);
  //   } catch (error) {
  //     console.error("Error deleting item:", error);
  //   }
  // };

  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/greet/greet/${itemIdToDelete}`);
      setGreetings((prevGreetings) => prevGreetings.filter((greet) => greet._id !== itemIdToDelete));
      setIsDeleteConfirmationModalOpen(false);
      // Set dataAdded flag to false after successful deletion
      setDataAdded(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  

  // const handleDeleteConfirmed = async () => {
  //   try {
  //     await axios.delete(`http://localhost:5000/api/greet/greet/${itemIdToDelete}`);
  //     setGreetings((prevGreetings) => prevGreetings.filter((greet) => greet._id !== itemIdToDelete));
  //     setIsDeleteConfirmationModalOpen(false);
  //     // Reload the page after successful deletion
  //     window.location.reload();
  //   } catch (error) {
  //     console.error("Error deleting item:", error);
  //   }
  // };

  const createGreet = async () => {
    const trimmedGreet = createGreetData.greet.trim();
    const trimmedMessage = createGreetData.message.trim();

    if (!trimmedGreet && !trimmedMessage) {
      setIsTimerPopupOpen(true); // Open the timer popup
      setTimeout(() => {
        setIsTimerPopupOpen(false); // Close the timer popup after 3 seconds
      }, 3000);
      return;
    }

   

    try {
      if (!dataAdded) {
        const response = await axios.post('http://localhost:5000/api/greet/greet', {
          greet: trimmedGreet,
          message: trimmedMessage
        });
        setCreateGreetData({ greet: '', message: '' });
        setGreetings([...greetings, response.data]);
        setDataAdded(true); // Set dataAdded flag to true after adding data
      } else {
        console.log("Data has already been added.");
      }
    } catch (error) {
      console.error('Error creating greet:', error);
    }
  };

  const updateGreet = async (greetId) => {
    if (!updateGreetData.greet && !updateGreetData.message) {
      console.error('Please fill in both Greet and Message fields.');
      return;
    }

    try {
      const response = await axios.patch(`http://localhost:5000/api/greet/greet/${greetId}`, updateGreetData);
      setUpdateGreetData({ id: '', greet: '', message: '' });
      getGreetings();
    } catch (error) {
      console.error('Error updating greet:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl container mx-auto mt-16 p-4 shadow-md rounded-md font-sans">
        <div className="mb-8 mt-4">
          {/* Create Greet */}
          <h2 className="text-xl font-bold font-sans mb-2 md:mb-0 text-orange-500">Greet Master</h2>
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mt-4">
            <input
              type="text"
              placeholder="Greet"
              className="mt-1 p-1 border rounded-md w-full md:w-auto focus:outline-none focus:ring focus:border-blue-300 font-sans text-sm"
              value={createGreetData.greet}
              onChange={(e) => setCreateGreetData({ ...createGreetData, greet: capitalizeFirstLetter(e.target.value) })}
              />
            <input
              type="text"
              placeholder="Message"
              className="mt-1 p-1 border rounded-md w-full md:w-auto focus:outline-none focus:ring focus:border-blue-300 text-sm"
              value={createGreetData.message}
              onChange={(e) => setCreateGreetData({ ...createGreetData, message: capitalizeFirstLetter(e.target.value) })}
              />
          </div>
          <div className="flex justify-center md:justify-start mt-1">
            <button className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mt-1 mx-auto" onClick={createGreet}>
              Create
            </button>
          </div>
        </div>

        {/* Get Greetings */}
        <div className="mt-4">
          <table className="min-w-full">
            <thead className="text-sm bg-zinc-100 text-yellow-600 border">
              <tr>
                <th className="p-2 text-left text-gray lg:pl-16 pl-4">Greet</th>
                <th className="text-left text-gray lg:pl-16 pl-4">Message</th>
                <th className="text-left text-gray lg:pl-12 pl-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {greetings.map((greet, index) => (
                <tr key={greet._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}>
                  <td className="lg:pl-16 pl-4">{greet.greet}</td>
                  <td className="lg:pl-16 pl-4">{greet.message}</td>
                  <td className="lg:pl-16 pl-4">
                    <button
                      onClick={() => handleEdit(greet)} // Edit functionality
                      className="text-gray-600 mr-3 font-sans focus:outline-none font-medium p-1 rounded-full px-2 text-sm shadow-md"
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        color="orange"
                        className="cursor-pointer"
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(greet._id)}
                      className="text-gray-600 mr-3 font-sans focus:outline-none font-medium p-1 rounded-full px-2 text-sm shadow-md"
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        color="red"
                        className="cursor-pointer"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Timer Popup */}
        {isTimerPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <p className="text-gray-700 font-semibold mb-4">Greet cannot be empty.</p>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-40 font-sans" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-container bg-white w-full md:w-96 p-6 m-4 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsEditModalOpen(false)}
              ></button>
              <div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className=" bg-red-100 text-red-600 p-1 px-2 hover:bg-red-200 rounded-full text-center float-right"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>
              <div className="p-1 text-center">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                  Edit Greet
                </h3>
                <div className="mb-4">
                  <label
                    htmlFor="editGreet"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-400 text-left"
                  >
                    Greet
                  </label>
                  <input
                    type="text"
                    id="editGreet"
                    name="editGreet"
                    value={editedGreet.greet}
                    onChange={(e) => setEditedGreet({ ...editedGreet, greet: capitalizeFirstLetter(e.target.value) })}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="editMessage"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-400 text-left"
                  >
                    Message
                  </label>
                  <input
                    type="text"
                    id="editMessage"
                    name="editMessage"
                    value={editedGreet.message}
                    onChange={(e) => setEditedGreet({ ...editedGreet, message: capitalizeFirstLetter(e.target.value) })}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="button"
                  className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mx-auto mt-4"
                  onClick={handleEditSubmit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <p className="text-gray-700 font-semibold mb-4">Are you sure you want to delete this item?</p>
              <div className="flex justify-center md:justify-start">
                <button onClick={handleDeleteConfirmed} className="bg-red-200 hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-full mr-2">Yes</button>
                <button onClick={() => setIsDeleteConfirmationModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full ">No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Greetings;
