'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';



const BankNameList = () => {
  const [bankNames, setBankNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBankName, setNewBankName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState(null);

  const router = useRouter()
  
  useEffect(() => {
    const token = localStorage.getItem("EmployeeAuthToken");
    if (!token) {
      router.push("/login");
    }
  }, []);


  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bankName/bankNames');
        setBankNames(response.data);
      } catch (error) {
        console.error('Error fetching bank names:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBankNames();
  }, []);

  const handleEditClick = (bankName) => {
    setSelectedBankName(bankName);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (bankName) => {
    setSelectedBankName(bankName);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(`http://localhost:5000/api/bankName/bankNames/${selectedBankName._id}`, {
        bankName: selectedBankName.bankName,
      });

      const updatedBankNames = bankNames.map((bn) => {
        if (bn._id === selectedBankName._id) {
          return { ...bn, bankName: selectedBankName.bankName };
        }
        return bn;
      });

      setBankNames(updatedBankNames);

      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating bank name:', error);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/bankName/bankNames/${selectedBankName._id}`);

      setBankNames((prevBankNames) => prevBankNames.filter((bn) => bn._id !== selectedBankName._id));

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting bank name:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/bankName/bankNames', { bankName: newBankName });

      const response = await axios.get('http://localhost:5000/api/bankName/bankNames');
      setBankNames(response.data);

      setNewBankName('');
      setIsSuccessPopupOpen(true);

      setTimeout(() => {
        setIsSuccessPopupOpen(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto bg-white p-4 rounded-lg shadow-md mt-20 font-sans">
        <h2 className='text-left font-bold text-lg'>Bank Master</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4 mt-4">
            <label htmlFor="newBankName" className="block text-sm font-bold text-gray-600 ">
              Add Bank
            </label>
            <input
              type="text"
              id="newBankName"
              name="newBankName"
              value={newBankName}
              placeholder='Enter Bank Name'
              onChange={(e) => setNewBankName(e.target.value)}
              className="mt-1 p-1 border rounded-md lg:w-1/3 focus:outline-none focus:ring focus:border-blue-300 text-sm"
              required
            />
          </div>

          <div className="col-span-2 flex justify-center mt-1">
            <button
              type="submit"
              className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mt-1 mx-auto"
            >
              Save
            </button>
          </div>
        </form>

        {isSuccessPopupOpen && (
          <div className="text-sm md:text-base fixed inset-0 z-50 flex items-center justify-center m-4">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Bank Name Added Successfully!</h2>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto max-h-full">
            <table className="min-w-full">
              <thead className="text-sm bg-zinc-100 text-yellow-600 border">
                <tr>
                  <th className="p-2 text-left text-gray lg:pl-32 pl-4">Bank Name</th>
                  <th className="text-center text-gray lg:pl-32 pl-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-md font-sans font-semibold">
                {bankNames.map((bankName, index) => (
                  <tr key={bankName._id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}
                  >
                    <td className="p-1.5 text-left text-gray lg:pl-32 pl-4 text-sm">{bankName.bankName}</td>
                    <td className="text-center text-gray lg:pl-32 pl-4">
                      <button
                        className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() => handleEditClick(bankName)}
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          color="orange"
                          className="cursor-pointer"
                        />{" "}
                      </button>
                      <button
                        className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() => handleDeleteClick(bankName)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center  m-4 p-6 text-sm md:text-base">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg w-96">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>

              <h2 className="text-2xl font-bold mb-4 md:text-base">Edit Bank Name</h2>

              <form onSubmit={handleEditSubmit} className="mb-4">
                <div className="mb-1">
                  <label htmlFor="editBankName" className="block text-sm font-medium text-gray-600">
                    Bank Name:
                  </label>
                  <input
                    type="text"
                    id="editBankName"
                    name="editBankName"
                    value={selectedBankName.bankName}
                    onChange={(e) => setSelectedBankName({ ...selectedBankName, bankName: e.target.value })}
                    className="p-2 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                    required
                  />
                </div>

                <div className="flex justify-center mt-1">
                  <button
                    type="submit"
                    className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mt-1 mx-auto"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center m-4">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <p className="text-gray-700 mb-4">Are you sure you want to delete this bank name?</p>
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
        )}
      </div>
    </>
  );
};

export default BankNameList;