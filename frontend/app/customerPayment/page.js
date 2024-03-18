"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faAnglesLeft, faAnglesRight, faPenToSquare, faPlus, faTrash, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

const CustomerPayment = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerDetails, setCustomerDetails] = useState({});
  const [creditBalance, setCreditBalance] = useState(0);
  const [debitAmount, setDebitAmount] = useState();
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateWiseRecords, setDateWiseRecords] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false); // New state for error popup
  const router = useRouter()

  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/customer/customers")
      .then((response) => setCustomers(response.data))
      .catch((error) => console.error("Error:", error));
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      axios
        .get(`http://localhost:5000/api/customer/customers/${selectedCustomer}`)
        .then((response) => {
          setCustomerDetails(response.data);
          setCreditBalance(response.data.credit);
          setBalance(response.data.balance); // Set the balance initially
          setDateWiseRecords(response.data.dateWiseRecords);
        })
        .catch((error) => console.error("Error:", error));
    } else {
      setCustomerDetails({});
      setCreditBalance(0);
      setBalance("");
      setDateWiseRecords([]);
    }
  }, [selectedCustomer]);

  const handleCustomerChange = (e) => {
    setSelectedCustomer(e.target.value);
  };

  const handleDebitChange = (e) => {
    setDebitAmount(e.target.value);
    // Calculate the balance by subtracting the debit amount from the customer's balance
    setBalance(customerDetails.balance - e.target.value);
  };

  // const handleDebitSubmission = async (e) => {
  //   e.preventDefault();

  //   try {
  //     // Update the customer's balance on the server
  //     const response = await axios.put(
  //       `http://localhost:5000/api/customer/updateBalance/${selectedCustomer}`,
  //       {
  //         debit: debitAmount,
  //       }
  //     );

  //     const updatedCustomer = response.data;

  //     // Update the state with the updated customer details
  //     setCustomerDetails(updatedCustomer);
  //     setShowSuccessPopup(true);

  //     // Fetch updated date-wise records
  //     const recordsResponse = await axios.get(
  //       `http://localhost:5000/api/customer/customers/${selectedCustomer}`
  //     );
  //     setDateWiseRecords((prevRecords) => [
  //       ...prevRecords,
  //       { debit: debitAmount, date: new Date().toISOString() },
  //     ]);
  //     // Clear the form inputs
  //   setDebitAmount("");
  //   setSelectedCustomer("");
  //   } catch (error) {
  //     console.error("Error submitting debit:", error);
  //   } finally {
  //     setLoading(false);
  //     setDebitAmount("");
  //   }
  // };
  const handleDebitSubmission = async (e) => {
    e.preventDefault();

    try {
      if (!debitAmount || debitAmount <= 0) {
        setErrorMessage("Please enter a debit amount.");
        setIsErrorPopupOpen(true); // Open the error popup
        return;
      }

      // Validate debit amount against balance
      const updatedBalance = customerDetails.balance - debitAmount;

      if (updatedBalance < 0) {
        setErrorMessage("Debit amount cannot exceed the balance.");
        setIsErrorPopupOpen(true); // Open the error popup
        return;
      }

      // Update the customer's balance on the server
      const response = await axios.put(
        `http://localhost:5000/api/customer/updateBalance/${selectedCustomer}`,
        {
          debit: debitAmount,
        }
      );

      const updatedCustomer = response.data;

      // Update the state with the updated customer details
      setCustomerDetails(updatedCustomer);
      setShowSuccessPopup(true);

      // Fetch updated date-wise records
      const recordsResponse = await axios.get(
        `http://localhost:5000/api/customer/customers/${selectedCustomer}`
      );
      setDateWiseRecords((prevRecords) => [
        ...prevRecords,
        { debit: debitAmount, date: new Date().toISOString() },
      ]);

      // Clear the form inputs
      setDebitAmount("");
      setSelectedCustomer("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error submitting debit:", error);
    } finally {
      setLoading(false);
    }
  };


  const formatDateTime = (dateString) => {
    const options = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };

    const dateTime = new Date(dateString);
    const formatter = new Intl.DateTimeFormat("en-GB", options);

    return formatter.format(dateTime);
  };

  // const handleDeleteRecord = async (recordId, debitAmount) => {
  //   try {
  //     // Update the debit amount and balance in the state
  //     setCustomerDetails((prevDetails) => ({
  //       ...prevDetails,
  //       debit: prevDetails.debit - debitAmount,
  //       balance: prevDetails.balance + debitAmount,
  //     }));

  //     // Subtract the deleted debit amount from the balance state
  //     setBalance((prevBalance) => prevBalance + debitAmount);

  //     // Update the date-wise records in the state
  //     setDateWiseRecords((prevRecords) =>
  //       prevRecords.filter((record) => record._id !== recordId)
  //     );

  //     // Delete the record on the server
  //     await axios.delete(
  //       `http://localhost:5000/api/customer/customers/${selectedCustomer}/dateWiseRecords/${recordId}`
  //     );

  //     // Fetch updated customer details from the server
  //     const customerResponse = await axios.get(
  //       `http://localhost:5000/api/customer/customers/${selectedCustomer}`
  //     );

  //     // Update the state with the updated customer details
  //     setCustomerDetails(customerResponse.data);

  //     // Show success popup only when the "Delete" button is clicked
  //     // and not when the page is refreshed
  //     // setShowSuccessPopup(true);
  //   } catch (error) {
  //     console.error("Error deleting record:", error);
  //   }
  // };

  const handleDeleteConfirmation = async () => {
    try {
      // Delete the record on the server
      await axios.delete(
        `http://localhost:5000/api/customer/customers/${selectedCustomer}/dateWiseRecords/${deleteRecordId}`
      );

      // Update the state after successful deletion
      const updatedDateWiseRecords = dateWiseRecords.filter(
        (record) => record._id !== deleteRecordId
      );
      setDateWiseRecords(updatedDateWiseRecords);

      // Close the delete modal
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  // Function to handle delete cancel
  const handleDeleteCancel = () => {
    // Close the delete modal without performing deletion
    setIsDeleteModalOpen(false);
  };

  // Modify handleDeleteRecord function to set deleteRecordId
  const handleDeleteRecord = (recordId, debitAmount) => {
    // Set the record id to be deleted
    setDeleteRecordId(recordId);
    // Open the delete modal
    setIsDeleteModalOpen(true);
  };

  // Function to close the error popup after 2 seconds
  useEffect(() => {
    if (isErrorPopupOpen) {
      const timer = setTimeout(() => {
        setIsErrorPopupOpen(false);
        setErrorMessage("");
      }, 2000);
      // Clear the timeout when the component unmounts or when isErrorPopupOpen changes
      return () => clearTimeout(timer);
    }
  }, [isErrorPopupOpen]);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 2000);
      // Clear the timeout when the component unmounts or when showSuccessPopup changes
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  return (
    <>
      <Navbar />
      {showSuccessPopup && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg text-green-600">
              Amount submitted successfully!
            </p>
          </div>
        </div>
      )}
      {isErrorPopupOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-container bg-white w-full md:w-96 p-6 m-4 rounded shadow-lg text-sm md:text-base"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4">Are you sure you want to delete this record?</p>
            <div className="flex justify-around mt-4">
              <button
                type="button"
                className=" bg-red-200  hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-full mr-2"
                onClick={handleDeleteConfirmation}
              >
                Yes
              </button>
              <button
                type="button"
                className=" bg-slate-300  hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-full "
                onClick={handleDeleteCancel}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-white p-8 shadow-md font-sans mt-11">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-400 text-left">
          Customer Payment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <div className="mb-4">
              <label htmlFor="customerDropdown" className="block font-semibold">
                Select Customer
              </label>
              <select
                id="customerDropdown"
                onChange={handleCustomerChange}
                value={selectedCustomer}
                className="p-1 border border-gray-300 rounded w-full"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="contactNumberInput"
                className="block font-semibold"
              >
                Contact Number:
              </label>
              <input
                type="text"
                id="contactNumberInput"
                value={customerDetails.mobileNumber || ""}
                readOnly
                className="p-1 border border-gray-300 rounded w-full"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="debitAmount" className="block font-semibold">
                Enter Debit Amount:
              </label>
              <input
                type="number"
                id="debitAmount"
                value={debitAmount}
                onChange={handleDebitChange}
                className="p-1 border border-gray-300 rounded w-full"
                required
                min={0}
              />
            </div>

            <form
              className="mt-4 flex justify-between"
              onSubmit={handleDebitSubmission}
            >
              <button
                type="submit"
                className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full mt-4 w-72 mx-auto"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </form>
          </div>
          <div className=" md:block w-md bg-gray-100 p-4 rounded lg:ml-8 h-min">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-400 text-left mb-3">
              Totals
            </h2>
            <div>
              <label htmlFor="creditInput" className="block font-semibold">
                Credit:
              </label>
              <input
                type="number"
                id="creditInput"
                value={Math.ceil(customerDetails.creditBalance) || ""}
                readOnly
                className="p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="debitInput" className="block font-semibold">
                Debit:
              </label>
              <input
                type="number"
                id="debitInput"
                value={customerDetails.debit || ""}
                readOnly
                className="p-1 border border-gray-300 rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="balanceInput" className="block font-semibold">
                Balance:
              </label>
              <input
                type="number"
                id="balanceInput"
                value={Math.ceil(balance)}
                readOnly
                className="p-2 border border-gray-300 rounded w-full"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="custom-scrollbars overflow-auto max-h-full">
            <table className="min-w-full">
              <thead className="text-sm bg-zinc-100 text-yellow-600 border">
                <tr>
                  <th className="p-3 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Sr No.</th>
                  <th className="p-3 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Payment Date</th>
                  <th className="p-3 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Customer Name</th>
                  <th className="p-3 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Debit Amount</th>
                  <th className="p-3 whitespace-nowrap text-center text-gray lg:pl-6 pl-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dateWiseRecords.map((record, index) => (
                  <tr key={record._id}>
                    <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{index + 1}</td>
                    <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{formatDateTime(record.date)}</td>
                    <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{customerDetails.customerName}</td>
                    <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">{record.debit}.00</td>
                    <td className="p-1 whitespace-nowrap text-center text-gray lg:pl-6 pl-4">
                      <button
                        className="text-gray-600 mr-3 font-sans focus:outline-none font-medium p-1 rounded-full px-2 text-sm shadow-md" style={{ background: "#ffff", }}
                        onClick={() =>
                          handleDeleteRecord(record._id, record.debit)}                    >
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
      </div>
    </>
  );
};

export default CustomerPayment;