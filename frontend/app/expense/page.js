'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const router = useRouter()
  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);


  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/expense/expenses');
        setExpenses(response.data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(`http://localhost:5000/api/expense/expenses/${selectedExpense._id}`, {
        expense: selectedExpense.expense,
      });

      const response = await axios.get('http://localhost:5000/api/expense/expenses');
      setExpenses(response.data);

      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/expense/expenses/${selectedExpense._id}`);

      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense._id !== selectedExpense._id));

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/expense/expenses', { expense: newExpense });

      const response = await axios.get('http://localhost:5000/api/expense/expenses');
      setExpenses(response.data);

      setNewExpense('');
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
        <h2 className='text-left font-bold text-lg text-orange-500'>Expense Master</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4 mt-4">
            <label htmlFor="newExpense" className="block text-sm font-medium text-gray-600">
              Expense Type
            </label>
            <input
              type="text"
              id="newExpense"
              name="newExpense"
              value={newExpense}
              onChange={(e) => setNewExpense(e.target.value)}
              className="mt-1 p-1 border rounded-md lg:w-1/3 focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div className="col-span-2 flex justify-center mt-1">
            <button
              type="submit"
              className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mt-1 mx-auto"
            >
              Add Expense
            </button>
          </div>
        </form>

        {isSuccessPopupOpen && (
          <div className="text-sm md:text-base fixed inset-0 z-50 flex items-center justify-center m-4">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Expense Added Successfully!</h2>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto max-h-full">
            <table className="min-w-full">
              <thead className="text-sm bg-zinc-100 text-yellow-600 ">
                <tr>
                  <th className="p-2 text-left text-gray lg:pl-32 pl-4">Expense Type</th>
                  <th className="p-2 text-left text-gray lg:pl-32 pl-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-md font-sans font-semibold">
                {expenses.map((expense, index) => (
                  <tr key={expense._id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}
                  >
                    <td className="p-2 text-left text-gray lg:pl-32 pl-4">{expense.expense}</td>
                    <td className="p-2 text-left text-gray lg:pl-28 pl-4">

                      <button
                        className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() => handleEditClick(expense)}
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          color="orange"
                          className="cursor-pointer"
                        />{" "}
                      </button>
                      <button
                        className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() => handleDeleteClick(expense)}
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

              <h2 className="text-2xl font-bold mb-4 md:text-base">Edit Expense</h2>

              <form onSubmit={handleEditSubmit} className="mb-4">
                <div className="mb-1">
                  <label htmlFor="editExpense" className="block text-sm font-medium text-gray-600">
                    Expense:
                  </label>
                  <input
                    type="text"
                    id="editExpense"
                    name="editExpense"
                    value={selectedExpense.expense}
                    onChange={(e) => setSelectedExpense({ ...selectedExpense, expense: e.target.value })}
                    className="p-2 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                    required
                  />
                </div>

                <div className="flex justify-center mt-2">
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
              <p className="text-red-600 font-semibold mb-4">Are you sure you want to delete this expense?</p>
              <button
                onClick={handleDeleteSubmit}
                className=" bg-red-200  hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-full mr-2"
              >
                Yes
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className=" bg-slate-300  hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-full "
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

export default ExpenseList;