'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';


const ExpenseFormList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState('');
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [ddChequeNo, setDdChequeNo] = useState('');
  const [online, setOnline] = useState('');
  const [amount, setAmount] = useState('');
  const [bankNames, setBankNames] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [error, setError] = useState(null);

  const handleEdit = (expense) => {
    setEditExpense(expense);

    // Ensure that the date is in the correct format
    const formattedDate = formatDate(expense.date);

    setExpenseDate(formattedDate);
    setNewExpense(expense.expenseTitle);
    setSelectedExpense(expense.expenseType);
    setDescription(expense.description);
    setPaidBy(expense.paidBy);
    setSelectedBank(expense.bankName);
    setDdChequeNo(expense.checkNo);
    setAmount(expense.amount);
    setIsEditModalOpen(true);
  };
  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [expenseDate, setExpenseDate] = useState(getCurrentDate());

  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem("EmployeeAuthToken")
    if (!token) {
      router.push("/login")
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenseResponse = await axios.get('http://localhost:5000/api/expense/expenses');
        setExpenses(expenseResponse.data);

        const bankResponse = await axios.get('http://localhost:5000/api/bankName/bankNames');
        setBankNames(bankResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
      fetchDataForTable();
    };

    fetchData();
  }, []);
  const [tableData, setTableData] = useState([]); // New state for table data


  const fetchDataForTable = async () => {
    try {
      const tableResponse = await axios.get('http://localhost:5000/api/expensesForm');
      setTableData(tableResponse.data);
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };




  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  // Function to open edit modal
  // const handleEdit = (expense) => {
  //   setEditExpense(expense);
  //   setExpenseDate(expense.date);
  //   setNewExpense(expense.expenseTitle);
  //   setSelectedExpense(expense.expenseType);
  //   setDescription(expense.description);
  //   setPaidBy(expense.paidBy);
  //   setSelectedBank(expense.bankName);
  //   setDdChequeNo(expense.checkNo);
  //   setAmount(expense.amount);
  //   setIsEditModalOpen(true);
  // };



  // Edit form submit function
  const handleEditSubmit = async () => {
    // Check if the amount field is empty
    if (amount === '') {
      console.error("Amount field cannot be empty.");
      return; // Exit the function early if amount is empty
    }
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/expensesForm/${editExpense._id}`,
        {
          date: expenseDate,
          expenseTitle: newExpense,
          expenseType: selectedExpense,
          description: description,
          paidBy: paidBy,
          bankName: selectedBank,
          checkNo: ddChequeNo,
          amount: amount,
        }
      );

      const updatedExpense = response.data;

      // Update the expenses state with the updated expense
      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense._id === updatedExpense._id ? updatedExpense : expense
        )
      );

      // Update the table data state
      fetchDataForTable();  // Assuming fetchDataForTable fetches the updated data
      // Clear the form after successful submission
      resetForm();
      setIsEditModalOpen(false);
      setEditExpense(null);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  // Utility function to format date




  const resetForm = () => {
    setExpenseDate(getCurrentDate());
    // setNewExpense('');
    setSelectedExpense('');
    setDescription('');
    setPaidBy('');
    setSelectedBank('');
    setDdChequeNo('');
    setOnline('');
    setAmount('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/expensesForm', {
        date: expenseDate,
        expenseType: selectedExpense,
        description: description,
        paidBy: paidBy,
        bankName: selectedBank,
        checkNo: ddChequeNo,
        online: online,
        amount: amount,
      });

      const newExpense = response.data;

      // Check if the new expense has a valid expenseType before updating the state
      if (newExpense.expenseType.trim() !== "") {
        // Update the state only if the new expense is valid
        setExpenses([...expenses, newExpense]);
        setTableData([...tableData, newExpense]);
      }

      resetForm();
      setIsSuccessPopupOpen(true);

      setTimeout(() => {
        setIsSuccessPopupOpen(false);
      }, 1000);

      console.log(response.data);
    } catch (error) {
      console.error('Error submitting form:', error.message);
      setError('Error submitting form: ' + error.message);
    }
  };

  const formatDateForTable = (inputDate) => {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteExpense, setDeleteExpense] = useState(null);

  // Function to open delete modal
  const handleDelete = (expense) => {
    setDeleteExpense(expense);
    setIsDeleteModalOpen(true);
  };
  const handleEditCancel = () => {
    // Clear the form when Cancel button is clicked
    resetForm();

    setIsEditModalOpen(false);
    setEditExpense(null);
  };

  // Function to handle actual deletion
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/expensesForm/${deleteExpense._id}`);

      // Update the expenses state by removing the deleted expense
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense._id !== deleteExpense._id)
      );

      // Update the table data state
      fetchDataForTable();  // Assuming fetchDataForTable fetches the updated data

      setIsDeleteModalOpen(false);
      setDeleteExpense(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };


  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto bg-white p-4 rounded-lg shadow-md mt-12 font-sans">
        <h2 className='text-left font-bold mb-4 text-xl text-orange-500'>Expense Form</h2>
        <form className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="mb-4">
              <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-600">
                Expense Date:
              </label>
              <input
                type="date"
                id="expenseDate"
                name="expenseDate"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="expenses" className="block text-sm font-medium text-gray-600 mr-5">
                Select Expense:<span className='text-red-500'>*</span>
              </label>
              <select
                id="expenses"
                name="expenses"
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                value={selectedExpense}
                onChange={(e) => setSelectedExpense(e.target.value)}
              >
                <option value="">Select an Expense</option>
                {expenses.map((expense) => (
                  <option key={expense._id} value={expense.expense}>
                    {expense.expense}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-600">
                Description:
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          </div>


          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Paid By:<span className='text-red-500'>*</span></label>
            <div className="mt-2 flex">
              <div className="flex items-center mr-4">
                <input
                  type="radio"
                  id="cash"
                  name="paidBy"
                  value="Cash"
                  checked={paidBy === "Cash"}
                  onChange={() => setPaidBy("Cash")}
                  className="mr-2"
                />
                <label htmlFor="cash" className="text-sm font-medium text-gray-600 mr-4">Cash</label>
                <div className="flex items-center mr-4">
                  <input
                    type="radio"
                    id="online"
                    name="paidBy"
                    value="Online"
                    checked={paidBy === "Online"}
                    onChange={() => setPaidBy("Online")}
                    className="mr-2"
                  />
                  <label htmlFor="online" className="text-sm font-medium text-gray-600">Online</label>
                </div>
              </div>
              <div className="items-center mr-4">
                <input
                  type="radio"
                  id="debitCard"
                  name="paidBy"
                  value="Cheque"
                  checked={paidBy === "Cheque"}
                  onChange={() => setPaidBy("Cheque")}
                  className="mr-2"
                />
                <label htmlFor="debitCard" className="text-sm font-medium text-gray-600">Cheque</label>
              </div>

              <div className="items-center">
                <input
                  type="radio"
                  id="creditCard"
                  name="paidBy"
                  value="Credit Card"
                  checked={paidBy === "Credit Card"}
                  onChange={() => {
                    setPaidBy("Credit Card");
                    // Additional logic to hide ChequeNo and Bank Name fields
                    setDdChequeNo('');
                    setSelectedBank('');
                  }}
                  className="mr-2"
                />
                <label htmlFor="creditCard" className="text-sm font-medium text-gray-600">Credit Card</label>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:flex-row md:items-center">
            {paidBy === "Cheque" && (
              <div className="mb-4 mr-2">
                <label htmlFor="bankName" className="text-sm font-medium text-gray-600 mr-2">
                  Bank Name:
                </label>
                <select
                  id="bankName"
                  name="bankName"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="mt-1 p-1 border rounded-md w-48 focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">Select a Bank</option>
                  {bankNames.map((bank) => (
                    <option key={bank._id} value={bank.name}>{bank.bankName}</option>
                  ))}
                </select>
              </div>
            )}

            {paidBy === "Cheque" && (
              <div className="mb-4">
                <label htmlFor="ddChequeNo" className="text-sm font-medium text-gray-600 mr-2">
                  DD/ChequeNo:
                </label>
                <input
                  type="text"
                  id="ddChequeNo"
                  name="ddChequeNo"
                  value={ddChequeNo}
                  onChange={(e) => setDdChequeNo(e.target.value)}
                  className="mt-1 p-1 border rounded-md w-52 mr-6 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center md:flex-row md:items-center">
            {paidBy === "Credit Card" && (
              <div className="mb-4">
                <label htmlFor="bankName" className="text-sm font-medium text-gray-600 mr-2">
                  Bank Name:
                </label>
                <select
                  id="bankName"
                  name="bankName"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="mt-1 p-1 border rounded-md w-52 focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">Select a Bank</option>
                  {bankNames.map((bank) => (
                    <option key={bank._id} value={bank.name}>{bank.bankName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* {paidBy === "Credit Card" && (
  <div className="mb-4">
    <label htmlFor="ddChequeNo" className="block text-sm font-medium text-gray-600">
      DD/ChequeNo:
    </label>
    <input
      type="text"
      id="ddChequeNo"
      name="ddChequeNo"
      value={ddChequeNo}
      onChange={(e) => setDdChequeNo(e.target.value)}
      className="mt-1 p-2 border rounded-md w-36 mr-6 focus:outline-none focus:ring focus:border-blue-300"
    />
  </div>
)} */}
          </div>
          <div className="flex w-full items-center">
            {paidBy === "Online" && (
              <div className="mb-4">
                <label htmlFor="online" className="text-sm font-medium text-gray-600 mr-2">Type:
                </label>
                <input
                  type="text"
                  id="online"
                  name="online"
                  value={online}
                  onChange={(e) => setOnline(e.target.value)}
                  className="mt-1 p-1 border rounded-md w-44 mr-6 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="text-sm font-medium text-gray-600 mr-2"> Amount:<span className='text-red-500'>*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 p-1 border rounded-md w-40 focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div className=" flex justify-center mt-1">
            <button
              type="submit"
              className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mt-1 mx-auto"
              onClick={handleSubmit}
            >
              Add Expense
            </button>
          </div>
        </form>

        {isSuccessPopupOpen && (
          <div className="text-sm md:text-base fixed inset-0 z-50 flex items-center justify-center m-4">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-green-600">Expense Added Successfully!</h2>
            </div>
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-0 flex justify-center items-center">
            <div
              className="modal-container bg-white w-full md:w-3/6 p-4 m-4 rounded shadow-lg text-sm md:text-base relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className='absolute right-4 md:right-12 top-4'>
                <button
                  onClick={handleEditCancel}
                  className="absolute bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>
              <h2 className='text-center font-bold mb-4 mt-6'>Edit Expense</h2>

              <div className="flex w-full items-center justify-between">
                <div className="mb-4">
                  <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-600">
                    Expense Date:
                  </label>
                  <input
                    type="date"
                    id="editExpenseDate"
                    name="editExpenseDate"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="p-1 border rounded-md lg:w-52 focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>
               
                <div className="mb-4">
                  <label htmlFor="expenses" className="block text-sm font-medium text-gray-600 mr-5">
                    Select Expense:<span className='text-red-500'>*</span>
                  </label>
                  <select
                    id="expenses"
                    name="expenses"
                    className="mt-1 p-1 border rounded-md w-72 focus:outline-none focus:ring focus:border-blue-300"
                    value={selectedExpense}
                    onChange={(e) => setSelectedExpense(e.target.value)}
                  >
                    <option value="">Select an Expense</option>
                    {expenses.filter((expense) => expense.expense).map((expense) => (
                      <option key={expense._id} value={expense.expense}>
                        {expense.expense}
                      </option>
                    ))}
                  </select>

                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-600">
                  Description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Paid By:<span className='text-red-500'>*</span></label>
                <div className="flex">
                  <div className="flex items-center mr-4">
                    <input
                      type="radio"
                      id="cash"
                      name="paidBy"
                      value="Cash"
                      checked={paidBy === "Cash"}
                      onChange={() => setPaidBy("Cash")}
                      className="mr-2"
                    />
                    <label htmlFor="cash" className="text-sm font-medium text-gray-600">Cash</label>
                  </div>
                  <div className="flex items-center mr-4">
                    <input
                      type="radio"
                      id="online"
                      name="paidBy"
                      value="Online"
                      checked={paidBy === "Online"}
                      onChange={() => setPaidBy("Online")}
                      className="mr-2"
                    />
                    <label htmlFor="online" className="text-sm font-medium text-gray-600">Online</label>
                  </div>
                  <div className=" items-center mr-4">
                    <input
                      type="radio"
                      id="debitCard"
                      name="paidBy"
                      value="Cheque"
                      checked={paidBy === "Cheque"}
                      onChange={() => setPaidBy("Cheque")}
                      className="mr-2"
                    />
                    <label htmlFor="debitCard" className="text-sm font-medium text-gray-600">Cheque</label>
                  </div>
                  <div className="items-center">
                    <input
                      type="radio"
                      id="creditCard"
                      name="paidBy"
                      value="Credit Card"
                      checked={paidBy === "Credit Card"}
                      onChange={() => {
                        setPaidBy("Credit Card");
                        // Additional logic to hide ChequeNo and Bank Name fields
                        setDdChequeNo('');
                        setSelectedBank('');
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="creditCard" className="text-sm font-medium text-gray-600">Credit Card</label>
                  </div>
                </div>
              </div>
              <div className="flex w-full items-center">
                {paidBy === "Cheque" && (
                  <div className="mb-4">
                    <label htmlFor="bankName" className="text-sm font-medium text-gray-600 mr-2">
                      Bank Name:
                    </label>
                    <select
                      id="bankName"
                      name="bankName"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className=" p-1 border rounded-md w-48 focus:outline-none focus:ring focus:border-blue-300"
                    >
                      <option value="">Select a Bank</option>
                      {bankNames.map((bank) => (
                        <option key={bank._id} value={bank.name}>{bank.bankName}</option>
                      ))}
                    </select>
                  </div>
                )}

                {paidBy === "Cheque" && (
                  <div className="mb-4">
                    <label htmlFor="ddChequeNo" className="text-sm font-medium text-gray-600 mr-2">
                      DD/ChequeNo:
                    </label>
                    <input
                      type="text"
                      id="ddChequeNo"
                      name="ddChequeNo"
                      value={ddChequeNo}
                      onChange={(e) => setDdChequeNo(e.target.value)}
                      className="p-1 border rounded-md w-52 mr-6 focus:outline-none focus:ring focus:border-blue-300"
                    />
                  </div>
                )}
              </div>
              <div className="flex w-full items-center">
                {paidBy === "Credit Card" && (
                  <div className="mb-4">
                    <label htmlFor="bankName" className=" block text-sm font-medium text-gray-600 mr-2">
                      Bank Name:
                    </label>
                    <select
                      id="bankName"
                      name="bankName"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="mt-1 p-1 border rounded-md w-52 focus:outline-none focus:ring focus:border-blue-300"
                    >
                      <option value="">Select a Bank</option>
                      {bankNames.map((bank) => (
                        <option key={bank._id} value={bank.name}>{bank.bankName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className=" w-full items-center">
                {paidBy === "Online" && (
                  <div className="mb-4">
                    <label htmlFor="online" className="block text-sm font-medium text-gray-600 mr-2">Type:
                    </label>
                    <input
                      type="text"
                      id="online"
                      name="online"
                      value={online}
                      onChange={(e) => setOnline(e.target.value)}
                      className="mt-1 p-1 border rounded-md w-44 mr-6 focus:outline-none focus:ring focus:border-blue-300"
                    />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="amount" className=" block text-sm font-medium text-gray-600 mr-2"> Amount:<span className='text-red-500'>*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 p-1 border rounded-md w-40 focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div className="flex justify-around p-2">
                <button
                  type="button"
                  className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-full md:w-72 mt-1 mx-auto"
                  onClick={handleEditSubmit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>

            <div
              className="modal-container bg-white w-full md:w-96 p-6 m-4 rounded shadow-lg text-sm md:text-base"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-4 font-semibold text-red-600">Are you sure you want to delete this expense?</p>
              <div className="flex justify-around mt-4">
                <button
                  type="button"
                  className=" bg-red-200  hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-full"
                  onClick={handleDeleteConfirm}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className=" bg-slate-300  hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-full "
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  No
                </button>

              </div>
            </div>
          </div>
        )}
        {/* Table section */}
        <div className='max-h-80 custom-scrollbars overflow-x-auto mt-4'>
          <table className="min-w-full mt-4">
            <thead className="text-sm bg-zinc-100 text-yellow-600 border">
              <tr>

                <th className=" p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Date</th>
                {/* <th className=" p-2">Expense Title</th> */}
                <th className=" p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Expense Type</th>
                <th className=" p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Description</th>
                <th className=" p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Paid By</th>
                <th className=" p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Bank Name</th>
                <th className=" p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">ChequeNo</th>
                <th className=" p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Payment</th>
                <th className=" p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Amount</th>
                <th className=" p-1 whitespace-nowrap text-center text-gray lg:pl-14 pl-4">Actions</th>
              </tr>
            </thead>
            <tbody className='text-sm'>
              {/* Map through the tableData to render rows */}
              {tableData.map((item) => (
                <tr key={item._id}>
                  <td className="text-center p-2 whitespace-nowrap">{formatDateForTable(item.date)}
                  </td>
                  {/* <td className="text-center p-2 whitespace-nowrap">{item.expenseTitle}</td> */}
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{item.expenseType}</td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{item.description}</td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{item.paidBy}</td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{item.bankName}</td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{item.checkNo}</td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{item.online}</td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{item.amount}</td>
                  <td className="flex whitespace-nowrap text-center text-gray lg:pl-14 pl-4">
                    <button
                      className="text-gray-600 mr-3 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                      onClick={() => handleEdit(item)}
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        color="orange"

                        className="cursor-pointer"
                      />{" "}

                    </button>
                    <button
                      className="text-gray-600 mr-3 font-sans focus:outline-none font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                      onClick={() => handleDelete(item)}
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
      </div>
    </>
  );
};

export default ExpenseFormList;