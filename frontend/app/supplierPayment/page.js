'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';

const SupplierPayment = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [supplierDetails, setSupplierDetails] = useState({});
  const [creditBalance, setCreditBalance] = useState("");
  const [balance, setBalance] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateWiseRecords, setDateWiseRecords] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // New state for success popup
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false); // New state for error popup
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null); // Define recordIdToDelete state
  
  const router = useRouter()

  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);


  useEffect(() => {
    axios.get('http://localhost:5000/api/supplier/suppliers')
      .then(response => setSuppliers(response.data))
      .catch(error => console.error('Error:', error));
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      axios.get(`http://localhost:5000/api/supplier/suppliers/${selectedSupplier}`)
        .then(response => {
          setSupplierDetails(response.data);
          setCreditBalance(response.data.credit);
          setBalance(response.data.balance);
          setDateWiseRecords(response.data.dateWiseRecords);
        })
        .catch(error => console.error('Error:', error));
    } else {
      setSupplierDetails({});
      setCreditBalance(0);
      setBalance(0);
      setDateWiseRecords([]);
    }
  }, [selectedSupplier]);

  const handleSupplierChange = (e) => {
    setSelectedSupplier(e.target.value);
  };

  const handleDebitSubmission = (e) => {
    e.preventDefault();

    if (!debitAmount || debitAmount <= 0) {
      setErrorMessage("Please Enter Paid Amount");
      setIsErrorPopupOpen(true);
      return;
    }

    const updatedBalance = supplierDetails.balance - debitAmount;

    if (updatedBalance < 0) {
      setErrorMessage("Debit amount cannot exceed the balance.");
      setIsErrorPopupOpen(true);
      return;
    }

    if (debitAmount <= creditBalance && !loading) {
      setLoading(true);

      axios.put(`http://localhost:5000/api/supplier/updateBalance/${selectedSupplier}`, {
        debit: debitAmount,
      })
        .then(response => {
          const updatedSupplier = response.data;
          setSupplierDetails(updatedSupplier);
          setShowSuccessPopup(true);
          axios.get(`http://localhost:5000/api/supplier/suppliers/${selectedSupplier}`)
            .then(response => {
              setDateWiseRecords(prevRecords => [
                ...prevRecords,
                { debit: debitAmount, date: new Date().toISOString() }
              ]);
            })
            .catch(error => console.error('Error fetching updated records:', error));
        })
        .catch(error => {
          console.error('Error submitting debit:', error);
          setErrorMessage("Error submitting debit. Please try again.");
          setIsErrorPopupOpen(true);
        })
        .finally(() => {
          setLoading(false);
          // Clear all fields by resetting the relevant state values
          setSelectedSupplier(""); // Reset selectedSupplier
          setDebitAmount(""); // Reset debitAmount
          setErrorMessage(""); // Clear error message
        });
    } else {
      setErrorMessage("Debit amount cannot exceed credit balance or request is still processing.");
      setIsErrorPopupOpen(true);
    }
  };

  const formatDateTime = (dateString) => {
    const options = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true, // Display time in 12-hour format
    };

    const dateTime = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('en-GB', options);

    return formatter.format(dateTime);
  };

  const handleDelete = async (recordId) => {
    // Set the item ID to be deleted and open the delete confirmation modal
    setRecordIdToDelete(recordId);
    setIsDeleteConfirmationModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      // Make a DELETE request to delete the record
      await axios.delete(`http://localhost:5000/api/supplier/suppliers/${selectedSupplier}/dateWiseRecords/${recordIdToDelete}`);
  
      // Update the local state to reflect the deletion
      setDateWiseRecords(prevRecords => prevRecords.filter(record => record._id !== recordIdToDelete));
  
      // Recalculate the balance after deletion
      const deletedRecord = dateWiseRecords.find(record => record._id === recordIdToDelete);
      if (deletedRecord) {
        // Update the balance by adding the deleted debit amount back
        const updatedBalance = supplierDetails.balance + deletedRecord.debit;
        setBalance(updatedBalance);
  
        // Update the debit amount by subtracting the deleted debit amount
        const updatedDebit = supplierDetails.debit - deletedRecord.debit;
        setSupplierDetails(prevDetails => ({
          ...prevDetails,
          debit: updatedDebit
        }));
      }
  
      // Close the delete confirmation modal
      setIsDeleteConfirmationModalOpen(false);
    } catch (error) {
      console.error('Error deleting record:', error);
      setErrorMessage("Error deleting record. Please try again.");
      setIsErrorPopupOpen(true);
    }
  };

  const handleDebitChange = (e) => {
    setDebitAmount(e.target.value);
    // Calculate the balance by subtracting the debit amount from the customer's balance
    setBalance(supplierDetails.balance - e.target.value);
  };

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 2000);
      // Clear the timeout when the component unmounts or when showSuccessPopup changes
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

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

  return (
    <>
      <Navbar />
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 font-sans">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg text-green-600">Amount Submitted Successfully!</p>
          </div>
        </div>
      )}
      {/* End of Success Popup */}
      {/* Error Popup */}
      {isErrorPopupOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 font-sans font-semibold">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}
      {/* End of Error Popup */}
      {isDeleteConfirmationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Modal Overlay */}
          <div className="fixed inset-0 bg-black opacity-50"></div>

          {/* Modal Content */}
          <div className="relative z-50 bg-white p-6 rounded-md shadow-lg">
            <p className="text-gray-700 font-semibold mb-4">
              Are you sure you want to delete this item?
            </p>

            {/* Delete Button */}
            <button
              onClick={handleDeleteConfirmed}
              className=" bg-red-200  hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-full mr-2"
            >
              Yes
            </button>
            {/* Cancel Button */}
            <button
              onClick={() => setIsDeleteConfirmationModalOpen(false)}
              className=" bg-slate-300  hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-full "
            >
              No
            </button>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto bg-white p-8 shadow-md mt-11 font-sans">
        <h2 className="mb-2 text-xl font-bold text-orange-500 dark:text-gray-400 text-left">Vendor Payment Form</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="mb-4">
            <div className="mb-2">
              <label htmlFor="supplierDropdown" className="block font-semibold">Select Vendor:</label>
              <select
                id="supplierDropdown"
                onChange={handleSupplierChange}
                value={selectedSupplier}
                className="p-1 border border-gray-300 rounded w-full"
              >
                <option value="">Select Vendor</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.vendorName}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label htmlFor="addressInput" className="block font-semibold">Address</label>
              <input
                type="text"
                id="addressInput"
                value={supplierDetails.address || ''}
                readOnly
                className="p-1 border border-gray-300 rounded w-full bg-slate-50"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="contactNumberInput" className="block font-semibold">Contact Number</label>
              <input
                type="text"
                id="contactNumberInput"
                value={supplierDetails.contactNumber || ''}
                readOnly
                className="p-1 border border-gray-300 rounded w-full bg-slate-50"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="emailIdInput" className="block font-semibold">Email ID</label>
              <input
                type="text"
                id="emailIdInput"
                value={supplierDetails.emailId || ''}
                readOnly
                className="p-1 border border-gray-300 rounded w-full bg-slate-50"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="gstNumberInput" className="block font-semibold">GST Number</label>
              <input
                type="text"
                id="gstNumberInput"
                value={supplierDetails.gstNumber || ''}
                readOnly
                className="p-1 border border-gray-300 rounded w-full bg-slate-50"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="debitAmount" className="block font-bold">Enter Paid Amount (₹) </label>
              <input
                type="number"
                id="debitAmount"
                value={debitAmount}
                onChange={handleDebitChange}
                className="p-1 border border-gray-300 rounded w-1/3"
                min={0}
              />
            </div>

            <form className="mt-4 flex justify-between" onSubmit={handleDebitSubmission}>
              <button
                type="submit"
                className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full mt-4 w-72 mx-auto"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>
            </form>
          </div>
          <div className="w-md bg-gray-100 p-4 rounded mx-auto lg:mr-12 lg:w-72 lg:mt-16 md:mt-16 h-min mt-2 font-sans">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-400 text-left mb-3">Account Details</h2>
            <div>
              <label htmlFor="creditInput" className="block font-semibold">Credit (₹)</label>
              <input
                type="number"
                id="creditInput"
                value={Math.ceil(supplierDetails.credit) || ''}
                readOnly
                className="p-1 border border-gray-300 rounded w-full "
              />
            </div>
            <div>
              <label htmlFor="debitInput" className="block font-semibold">Debit (₹)</label>
              <input
                type="number"
                id="debitInput"
                value={supplierDetails.debit || ''}
                readOnly
                className="p-1 border border-gray-300 rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="balanceInput" className="block font-semibold">Balance (₹)</label>
              <input
                type="number"
                id="balanceInput"
                value={Math.ceil(balance)}
                readOnly
                className="p-1 border border-gray-300 rounded w-full"
              />
            </div>
          </div>
        </div>
        <div className="custom-scrollbars overflow-auto max-h-full">
          <table className=" min-w-full mt-4">
            <thead className="text-sm bg-zinc-100 text-yellow-600 border">
              <tr>
                <th className="p-3 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Payment Date</th>
                <th className="p-3 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Vendor Name</th>
                <th className="p-3 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Debit Amount</th>
                <th className="p-3 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {dateWiseRecords.map(record => (
                <tr key={record._id}>
                  <td className='p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4'>{formatDateTime(record.date)}</td>
                  <td className='p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4'>{supplierDetails.vendorName}</td>
                  <td className='p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4'>{record.debit}</td>
                  <td className='p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4'>
                    
                    <button onClick={() => handleDelete(record._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
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

export default SupplierPayment;