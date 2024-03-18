"use client";

// components/PurchaseForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faTimes, faXmark, faPenToSquare, } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";



//item modal//
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const NewItemModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    companyName: "",
    unit: "",
    lessStock: "",
  });

  const [isRequiredError, setIsRequiredError] = useState(false);
  const [units, setUnits] = useState([]); // Make sure units are defined and fetched
  const [items, setItems] = useState([]); // State for items
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [itemToEdit, setItemToEdit] = useState(null);
  const [selectedUnitDetails, setSelectedUnitDetails] = useState(null);


  useEffect(() => {
    // Fetch the list of items when the component mounts
    const fetchItems = async () => {
      try {
        const itemsResponse = await axios.get("http://localhost:5000/api/item/items");
        console.log(itemsResponse)
        setItems(itemsResponse.data);
      } catch (error) {
        console.error("Error fetching items:", error.message);
      }
    };

    fetchItems();
  }, []); // Run this effect only once when the component mounts


  useEffect(() => {
    // Fetch the list of units when the component mounts
    const fetchUnits = async () => {
      try {
        const unitsResponse = await axios.get("http://localhost:5000/api/unit/units");
        setUnits(unitsResponse.data);
      } catch (error) {
        console.error("Error fetching units:", error.message);
      }
    };

    fetchUnits();
  }, []); // Run this effect only once when the component mounts

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Capitalize the first letter if the input is not empty
    const capitalizedValue =
      value !== "" && (name === "itemName" || name === "companyName")
        ? capitalizeFirstLetter(value)
        : value;

    if (name === "unit") {
      // Fetch the details of the selected unit
      try {
        const unitDetailsResponse = await axios.get(
          `http://localhost:5000/api/unit/units/${value}`
        );
        setSelectedUnitDetails(unitDetailsResponse.data); // Assuming the API returns the details of the unit
      } catch (error) {
        console.error("Error fetching unit details:", error.message);
      }
    }

    // Update the form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Your logic to handle the form submission
    console.log('Form Data:', formData);



    // Check for required fields
    if (!formData.itemName || !formData.lessStock || !formData.unit) {
      setIsRequiredError(true);
      return;
    }

    // Check if the item name already exists
    const isItemNameUnique = items.every(
      (item) => item.itemName !== formData.itemName
    );

    if (!isItemNameUnique) {
      setErrorMessage("Item name must be unique.");
      return;
    }

    try {
      let response;
      if (itemToEdit) {
        // If editing, make a PUT request
        response = await axios.put(
          `http://localhost:5000/api/item/items/${itemToEdit._id}`,
          formData
        );

        console.log("Edit Response:", response.data); // Log successful response
      } else {
        // If creating, make a POST request
        response = await axios.post("http://localhost:5000/api/item/items", {
          ...formData,
          unit: formData.unit || "",
          lessStock: formData.lessStock || 0,
        });

        console.log("Create Response:", response.data); // Log successful response
      }

      // Update the local state with the new item data after the API call is successful
      setItems((prevItems) =>
        itemToEdit
          ? prevItems.map((item) =>
            item._id === itemToEdit._id ? { ...item, ...formData } : item
          )
          : [...prevItems, response.data]
      );

      // Optionally, reset the form after submission
      setFormData({
        itemName: "",
        companyName: "",
        unit: "",
        lessStock: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error.message);
    }
  };

  return (
    <div
      className={`modal-container bg-white p-6 rounded-md shadow-md relative font-sans ${isOpen ? "block" : "hidden"
        }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>
      <div className="p-1 text-left">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400 text-left">
          Item Master
        </h3>
        <form onSubmit={handleSubmit}>


          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Item Name */}
            <div className="">
              <label
                htmlFor="itemName"
                className="block text-sm font-medium text-gray-600"
              >
                Item Name:<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            {/* Company Name */}
            <div className="">
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-600"
              >
                Company Name:
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            {/* Less Stock */}
            <div className="">
              <label
                htmlFor="lessStock"
                className="block text-sm font-medium text-gray-600"
              >
                Less Stock:<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="lessStock"
                name="lessStock"
                value={formData.lessStock}
                onChange={handleChange}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                min={0}
              />
            </div>

            {/* Unit */}
            <div className="">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-600">
                Unit:<span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="mt-1 p-1 w-full border rounded-md"
              >
                <option value="">Select a unit</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit.unit}>
                    {unit.unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className=" flex justify-center mt-3">
            <button
              type="submit"
              className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mt-1 mx-auto"
            >
              Save
            </button>
          </div>
        </form>
      </div>
      {/* Item List */}
      <div className="max-h-56 custom-scrollbars overflow-y-auto mt-4">
        <table className="w-full border-collapse ">
          <thead className="text-sm bg-zinc-100 text-yellow-600 border">
            <tr>
              <th className=" p-1 text-left text-gray lg:pl-12 pl-4">
                Item Name
              </th>
              <th className=" text-left text-gray lg:pl-12 pl-4">
                Company Name
              </th>
              <th className=" text-left text-gray lg:pl-12 pl-4">Unit</th>
              <th className="text-left text-gray lg:pl-12 pl-4">
                Stock Qty
              </th>{" "}
              {/* Add this line */}
              <th className="text-left text-gray lg:pl-12 pl-4">
                Less Stock
              </th>{" "}
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((item, index) => (
              <tr
                key={item._id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-100 "}
              >
                <td className="lg:pl-12 pl-4">{item.itemName}</td>
                <td className="lg:pl-12 pl-4 p-2">
                  {item.companyName || "N/A"}
                </td>{" "}
                {/* Display 'N/A' if companyName is not provided */}
                <td className=" lg:pl-12 pl-4 p-1">{item.unit}</td>
                <td className="lg:pl-12 pl-4 p-1">{item.stockQty}</td>
                <td className="lg:pl-12 pl-4 p-1">{item.lessStock}</td>{" "}

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
//close item modal//

//unit modal//

const NewUnitModal = ({ isOpen, onClose }) => {
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
    <div className={`fixed inset-0 z-40 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black opacity-50"></div>

      {/* Modal Content */}
      <div className="relative z-40 bg-white p-6 rounded-md shadow-lg w-96">
        <button
          type="button"
          className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        <h2 className="text-xl font-bold mb-4">Add Unit</h2>

        {/* Edit Form */}
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
        <div className="max-h-56 custom-scrollbars overflow-y-auto mt-4">
          <table className="min-w-full ">
            <thead className="text-sm bg-zinc-100 text-yellow-700 border">
              <tr>
                <th className="p-1 text-center text-gray">Unit</th>
              </tr>
            </thead>
            <tbody className="text-sm font-sans font-semibold">
              {units.map((unit, index) => (
                <tr key={unit._id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}
                >
                  <td className="p-1 text-center text-gray">{unit.unit}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
//close unit modal//


//gstForm modal//
const NewGstModal = ({ isOpen, onClose }) => {
  const [gstPercentage, setGSTPercentage] = useState('');
  const [gstList, setGSTList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  const router = useRouter()
  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);

  const handleConfirmDelete = async () => {
    try {
      // Send a delete request to the server
      await axios.delete(`http://localhost:5000/api/gst/gst/${deletingItemId}`);
      // Fetch the updated GST list after deletion
      fetchGSTList();
    } catch (error) {
      console.error('Error deleting GST item:', error.message);
    }

    // Close the popup after deletion
    setShowDeletePopup(false);
    setDeletingItemId(null);
  };

  useEffect(() => {
    fetchGSTList();
  }, []);

  const fetchGSTList = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/gst/list');
      setGSTList(response.data || []);
    } catch (error) {
      console.error('Error fetching GST list:', error.message);
    }
  };

  const handleInputChange = (e) => {
    setGSTPercentage(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/gst/create', { gstPercentage });
      fetchGSTList();
      setGSTPercentage('');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        setErrorMessage(errorMessage);
        setShowModal(true);
        // Close the modal after 2 seconds
        setTimeout(() => {
          setShowModal(false);
          setErrorMessage('');
        }, 2000);
      } else {
        console.error('Error submitting GST form:', error.message);
      }
    }
  };

  const handleDeleteClick = (itemId) => {
    setDeletingItemId(itemId);
    setShowDeletePopup(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setErrorMessage('');
  };

  const handleCancelDelete = () => {
    // Cancel the delete action
    setShowDeletePopup(false);
    setDeletingItemId(null);
  };
  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black opacity-50"></div>

      {/* Modal Content */}
      <div className="relative z-40 bg-white p-6 rounded-md shadow-lg w-96">
        <button
          type="button"
          className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        {/* Edit Form */}
        <form onSubmit={handleFormSubmit} className="mb-4 flex items-center ml-3">
          <div className="text-xl font-semibold font-sans md:mb-0 ">
            <h1 className="text-xl font-bold font-sans mb-2 md:mb-0 text-orange-600">GST For Purchase</h1>
            <label htmlFor="gstPercentage" className="block text-sm font-bold text-gray-600 mt-4">
              GST Percentage (%)
            </label>
            <input
              type="text"
              id="gstPercentage"
              name="gstPercentage"
              value={gstPercentage}
              onChange={handleInputChange}
              className="mt-1 p-0.5 border rounded-md focus:outline-none focus:ring focus:border-blue-300 w-28"
              required
            />
            <div className='flex justify-center mt-4'>
              <button
                type="submit"
                className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full
                w-40  mx-auto mb-3"
              >
                Save
              </button>
            </div>
          </div>
        </form>
        <div className="max-h-44 custom-scrollbars overflow-y-auto mt-4">
          <table className="min-w-full  border border-gray-300 mb-4 mx-auto ">
            <thead className='text-base bg-zinc-100 text-yellow-700 border'>
              <tr>
                <th className="text-left text-gray lg:pl-16 pl-4">GST Percentage</th>
              </tr>
            </thead>
            <tbody>
              {gstList.map((gst, index) => (
                <tr key={gst._id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}

                >
                  <td className=" p-1 text-left text-gray lg:pl-16 pl-4">{gst.gstPercentage}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
//close gstForm modal//

//vendor modal//
const NewVendorModal = ({ isOpen, onClose }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [editedSupplier, setEditedSupplier] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false); // New state for success popup
  const [error, setError] = useState("");


  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const [formData, setFormData] = useState({
    vendorName: "",
    address: "",
    contactNumber: "",
    email: "",
    gstNumber: "",
    openingBalance: "",
  });

  const router = useRouter()
  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);


  // Function to handle input changes and capitalize the first letter
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Capitalize the first letter if the input is not empty
    let capitalizedValue = value !== '' && (name === 'vendorName' || name === 'address')
      ? capitalizeFirstLetter(value)
      : value;

    // If the input is a contact number, update the value with only numeric characters
    if (name === 'contactNumber') {
      // Remove non-numeric characters from the value
      const numericValue = value.replace(/[^0-9]/g, '');

      // Trim the value to 10 digits
      capitalizedValue = numericValue.slice(0, 10);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: capitalizedValue,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form fields
      if (formData.contactNumber.length !== 10) {
        throw new Error('Contact number must be exactly 10 digits long');
      }

      // Remove email field if it is empty
      if (formData.email === '') {
        delete formData.email;
      }

      // Make POST request to add supplier
      const response = await axios.post(
        "http://localhost:5000/api/supplier/suppliers",
        formData
      );

      // Handle successful response
      console.log("Supplier added successfully:", response.data);

      // Fetch updated list of suppliers
      const updatedSuppliersResponse = await axios.get(
        "http://localhost:5000/api/supplier/suppliers"
      );
      setSuppliers(updatedSuppliersResponse.data);

      // Reset form data
      setFormData({
        vendorName: "",
        address: "",
        contactNumber: "",
        email: "",
        gstNumber: "",
        openingBalance: "",
      });

      // Open success popup
      setIsSuccessPopupOpen(true);

      // Close success popup after a few seconds
      setTimeout(() => {
        setIsSuccessPopupOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding supplier:", error.message);
      // Clear error message after 2 seconds
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/supplier/suppliers"
        );
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  const handleEdit = (supplier) => {
    setEditedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleDelete = (supplier) => {
    setEditedSupplier(supplier);
    setIsDeleteConfirmationModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validation check for contact number
      if (formData.contactNumber.length !== 10) {
        console.error('Error adding supplier: Contact number must be a 10-digit number');
        setIsContactModalOpen(true);

        // Set a timer to close the error modal after 2000 milliseconds (2 seconds)
        setTimeout(() => {
          setIsContactModalOpen(false);
        }, 2000);
        return; // Exit the function early if validation fails
      }
      const response = await axios.patch(
        `http://localhost:5000/api/supplier/suppliers/${editedSupplier._id}`,
        editedSupplier
      );

      // Assuming the API returns the updated supplier
      const updatedSupplier = response.data;

      // Update the state with the updated supplier
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((supplier) =>
          supplier._id === updatedSupplier._id ? updatedSupplier : supplier
        )
      );

      // Close the edit modal
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      // Assuming the API returns the deleted supplier
      await axios.delete(
        `http://localhost:5000/api/supplier/suppliers/${editedSupplier._id}`
      );

      // Update the state by removing the deleted supplier
      setSuppliers((prevSuppliers) =>
        prevSuppliers.filter((supplier) => supplier._id !== editedSupplier._id)
      );

      // Close the delete modal
      setIsDeleteConfirmationModalOpen(false);
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };
  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black opacity-50"></div>

      {/* Modal Content */}
      <div className="relative z-40 bg-white p-6 rounded-md shadow-lg md:w-2/3 w-72 lg:w-2/3">
        <button
          type="button"
          className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        <h2 className="text-xl font-bold mb-4">Add Vendor</h2>
        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="mx-auto mt-4">
          {error && (
            <div className="text-red-500 mb-4 text-center">{error}</div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-3 gap-2">
            <div className="lg:mb-4 md:mb-4 mb-0">
              <label
                htmlFor="vendorName"
                className="block text-sm font-medium text-gray-600"
              >
                Vendor Name: <span className='text-red-500'>*</span>
              </label>
              <input
                type="text"
                id="vendorName"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                className="mt-1 p-1  border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>

            <div className="lg:mb-4 md:mb-4 mb-0">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-600"
              >
                Address:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            <div className="lg:mb-4 md:mb-4 mb-0">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600"
              >
                Email ID:
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"

              />
            </div>




            <div className="lg:mb-4 md:mb-4 mb-0">
              <label
                htmlFor="openingBalance"
                className="block text-sm font-medium text-gray-600"
              >
                Opening Balance:
              </label>
              <input
                type="text"
                id="openingBalance"
                name="openingBalance"
                value={formData.openingBalance}
                onChange={handleChange}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="lg:mb-4 md:mb-4 mb-0">
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-gray-600 -ml-2 lg:ml-0 md:ml-0"
              >
                Contact Number: <span className='text-red-500'>*</span>
              </label>
              <input
                type="number"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>

            <div className="lg:mb-4 md:mb-4 mb-0">
              <label
                htmlFor="gstNumber"
                className="block text-sm font-medium text-gray-600"
              >
                GST Number:
              </label>
              <input
                type="text"
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="mt-1 p-1 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>





          </div>
          <div className="col-span-2 flex justify-center mt-1">
            <button
              type="submit"
              className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full mt-4 md:w-72 w-full mx-auto"
            >
              Submit
            </button>
          </div>
        </form>
        <div className="max-h-44 custom-scrollbars overflow-y-auto mt-4">
          <table className="min-w-full">
            <thead className="text-sm bg-zinc-100 text-yellow-600 border">
              <tr>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Name</th>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Address</th>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Contact No.</th>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">Email</th>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">GST</th>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                  Opening Bal.
                </th>
              </tr>
            </thead>
            <tbody className="text-sm font-sans font-semibold">
              {suppliers.map((supplier, index) => (
                <tr key={supplier._id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 '}
                >
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                    {supplier.vendorName}
                  </td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                    {supplier.address}
                  </td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                    {supplier.contactNumber}
                  </td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                    {supplier.email}
                  </td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                    {supplier.gstNumber}
                  </td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                    {supplier.openingBalance}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
//close vendor modal//

const PurchaseForm = () => {
  const [itemTotals, setItemTotals] = useState({});
  const [lastItemIndex, setLastItemIndex] = useState(-1);
  const [stockQty, setStockQty] = useState("");
  const [discount, setDiscount] = useState(""); // Step 1
  const [grandTotal, setGrandTotal] = useState(""); // New state for grand total
  const [gst, setGst] = useState(0);
  const [isGSTModalOpen, setIsGSTModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [currentItemGst, setCurrentItemGst] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [itemIndexToDelete, setItemIndexToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);
  const [isNewGstModalOpen, setIsNewGstModalOpen] = useState(false);
  const [isNewVendorModalOpen, setIsNewVendorModalOpen] = useState(false);






  const calculateItemTotal = (item) => {
    const subtotal = parseFloat(item.quantity) * parseFloat(item.pricePerQty);

    if (parseFloat(item.gst) === 0) {
      return subtotal;
    } else {
      const itemGst = parseFloat(item.gst);
      const gstAmount = (subtotal * itemGst) / 100;
      return subtotal + gstAmount;
    }
  };
  const router = useRouter()
  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);

  const handleEditItem = (index) => {
    // Get the item to be edited
    const editedItem = items[index];

    // Populate the form fields with the values of the selected item
    setFormData({
      date: editedItem.date,
      billNo: editedItem.billNo,
      vendor: editedItem.vendor,
      itemName: editedItem.itemName,
      quantity: editedItem.quantity,
      unit: editedItem.unit,
      pricePerQty: editedItem.pricePerQty,
      gst: editedItem.gst,
      gstAmount: editedItem.gstAmount,
      paidAmount: editedItem.paidAmount,
    });

    // Set the discount value
    setDiscount(parseFloat(editedItem.discount || 0));

    // Remove the edited item from the items list
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleConfirmDelete = () => {
    // Get the index of the item to be deleted
    const index = itemToDeleteIndex;

    // Logic to handle item deletion
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);

    // Recalculate totals and set discount to 0
    const newTotals = updatedItems.reduce((totals, item) => {
      totals[item.itemName] = calculateItemTotal(item);
      return totals;
    }, {});

    // Set the discount to 0
    setDiscount(0);

    // Set the updated totals to the state
    setItemTotals(newTotals);

    // Clear the form data
    setFormData({
      date: "",
      billNo: "",
      vendor: "",
      itemName: "",
      quantity: "",
      unit: "",
      pricePerQty: "",
      gst: "",
      gstAmount: "",
      paidAmount: "",
    });

    // Hide the delete confirmation popup
    setDeleteConfirmation(false);
    setItemToDeleteIndex(null);

  };

  const handleDeleteClick = (index) => {
    // Set the index of the item to be deleted and show the delete confirmation popup
    setItemToDeleteIndex(index);
    setDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    // Clear the itemToDeleteIndex and hide the delete confirmation popup
    setItemToDeleteIndex(null);
    setDeleteConfirmation(false);
  };

  // Function to open the GST form modal
  const openGSTModal = () => {
    setIsGSTModalOpen(true);
  };

  // Function to close the GST form modal
  const closeGSTModal = () => {
    setIsGSTModalOpen(false);
  };

  const openUnitModal = () => {
    setIsUnitModalOpen(true);
  };

  // Function to close the GST form modal
  const closeUnitModal = () => {
    setIsUnitModalOpen(false);
  };

  const openProductModal = () => {
    setIsProductModalOpen(true);
  };

  // Function to close the GST form modal
  const closeProductModal = () => {
    setIsProductModalOpen(false);
  };

  const openVendorModal = () => {
    setIsVendorModalOpen(true);
  };

  // Function to close the GST form modal
  const closeVendorModal = () => {
    setIsVendorModalOpen(false);
  };

  const [formData, setFormData] = useState({
    billNo: "",
    date: getCurrentDate(),
    vendor: "",
    itemName: "",
    quantity: "",
    unit: "",
    pricePerQty: "",
    gst: 0,
    gstAmount: "",
    paidAmount: "",
  });

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [gsts, setGsts] = useState([]);
  const [items, setItems] = useState([]);
  const sortedProducts = products.slice().sort((a, b) => a.itemName.localeCompare(b.itemName));

  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    const fetchStockQty = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/purchase/purchase/stockQty?itemName=${formData.itemName}`
        );
        console.log("stock Quantity", response.data.stockQty);
        setStockQty(response.data.stockQty);
      } catch (error) {
        console.error("Error fetching stock quantity:", error);
      }
    };

    if (formData.itemName) {
      fetchStockQty();
    }
  }, [formData.itemName]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/supplier/suppliers"
        );
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/item/items"
        );
        setProducts(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching Products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchGSTList = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/gst/list");
        setGsts(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching Products:", error);
      }
    };
    fetchGSTList();
  }, []);

  useEffect(() => {
    const fetchUnitList = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/unit/units"
        );
        setUnits(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching Products:", error);
      }
    };

    fetchUnitList();
  }, []);

  useEffect(() => {
    const subtotal = Object.values(itemTotals).reduce(
      (total, itemTotal) => total + (itemTotal || 0),
      0
    );
    const discountAmount = parseFloat(discount) || 0;
    const calculatedGrandTotal = subtotal - discountAmount;

    setGrandTotal(calculatedGrandTotal.toFixed(2));
  }, [itemTotals, discount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "discount") {
      setDiscount(value);
    } else if (name === "paidAmount") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value !== undefined ? value : "",
      }));
    } else if (name === "gst") {
      // Update GST amount for the current item
      const selectedProduct = products.find(
        (product) => product.itemName === formData.itemName
      );
      const gstPercentage = parseFloat(value); // Convert GST percentage to a float

      if (selectedProduct && !isNaN(gstPercentage)) {
        const gstAmount =
          (parseFloat(formData.quantity) *
            parseFloat(formData.pricePerQty) *
            gstPercentage) /
          100;
        setCurrentItemGst(gstAmount);
      } else {
        setCurrentItemGst(0); // Set GST amount to 0 if there is an issue with GST percentage
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        gst: value !== undefined ? value : 0, // Set default GST to 0 if not selected
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
    console.log("Updated itemName:", formData.itemName);
  };

  useEffect(() => {
    const newItemTotal = calculateItemTotal(formData);
    setItemTotals((prevItemTotals) => ({
      ...prevItemTotals,
      [formData.itemName]: newItemTotal,
    }));
  }, [formData, discount]);

  const handleAddItem = () => {
    // Check if the GST percentage is 0
    if (parseFloat(formData.gst) === 0) {
      // GST is 0, proceed to add the item without checking other required fields
      const newItem = createNewItem({
        ...formData,
        gst: 0, // Set GST to 0
        gstAmount: 0, // Set GST amount to 0
      });

      if (items.some((item) => item.itemName === newItem.itemName)) {
        setErrorMessage(
          "Item already added in the list. Please choose a different item."
        );
        setShowErrorModal(true);
        return;
      }


      // Update state
      setItems((prevItems) => [...prevItems, newItem]);
      setFormData({
        date: formData.date,
        billNo: formData.billNo,
        vendor: formData.vendor,
        itemName: "",
        quantity: "",
        unit: "",
        pricePerQty: "",
        gst: formData.gst, // Reset GST in the form
        gstAmount: "", // Reset GST amount in the form
        paidAmount: "",
      });
      setLastItemIndex((prevLastItemIndex) => prevLastItemIndex + 1);
    } else {
      if (
        !formData.billNo ||
        !formData.date ||
        !formData.vendor ||
        !formData.itemName ||
        !formData.quantity ||
        !formData.unit ||
        !formData.pricePerQty ||
        !formData.gst
      ) {
        console.error("Please fill in all required fields.");
        return;
      }

      // Calculate GST amount for the current item
      const gstPercentage = parseFloat(formData.gst);
      const gstAmount =
        (parseFloat(formData.quantity) *
          parseFloat(formData.pricePerQty) *
          gstPercentage) /
        100;

      // Create a new item object
      const newItem = createNewItem({
        ...formData,
        gst: gstPercentage, // Use GST as GST percentage
        gstAmount: gstAmount.toFixed(2), // Store GST amount in the item
      });

      if (items.some((item) => item.itemName === newItem.itemName)) {
        console.error(
          "Item already added in the list. Please choose a different item."
        );
        return;
      }

      // Update state
      setItems((prevItems) => [...prevItems, newItem]);
      setFormData({
        date: formData.date,
        billNo: formData.billNo,
        vendor: formData.vendor,
        itemName: "",
        quantity: "",
        unit: "",
        pricePerQty: "",
        gst: "", // Reset GST in the form
        gstAmount: "", // Reset GST amount in the form
        paidAmount: "",
      });
      setLastItemIndex((prevLastItemIndex) => prevLastItemIndex + 1);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  // Helper function to create a new item object
  const createNewItem = (formData) => ({
    billNo: formData.billNo,
    date: formData.date,
    vendor: formData.vendor,
    itemName: formData.itemName,
    quantity: formData.quantity,
    unit: formData.unit,
    pricePerQty: formData.pricePerQty,
    gst: formData.gst,
    gstAmount: formData.gstAmount,
  });

  const handleSave = async () => {
    try {
      // Calculate the GST amount based on the individual items
      const calculatedGst = parseFloat(gst).toFixed(2); // Use calculated GST
      const calculatedSubtotal = parseFloat(
        Object.values(itemTotals)
          .reduce((total, itemTotal) => total + (itemTotal || 0), 0)
          .toFixed(2)
      );
      const calculatedBalance = (
        parseFloat(grandTotal) - parseFloat(formData.paidAmount || 0)
      ).toFixed(2);

      const formattedItems = items.map((item) => ({
        productName: item.itemName,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        pricePerQty: parseFloat(item.pricePerQty),
        gstAmount: item.gstAmount

      }));

      const data = {
        date: formData.date || "",
        billNo: formData.billNo || "",
        vendor: formData.vendor || "",
        subtotal: isNaN(calculatedSubtotal) ? 0 : calculatedSubtotal,
        gst: isNaN(calculatedGst) ? 0 : calculatedGst,
        gstAmount: parseFloat(currentItemGst).toFixed(2), // Use currentItemGst
        paidAmount: parseFloat(formData.paidAmount || 0).toFixed(2),
        discount: parseFloat(discount || 0).toFixed(2),
        items: formattedItems,
        balance: calculatedBalance, // Include balance in the data
      };

      // Log the data to be saved
      console.log("Data to be saved:", data);

      // Make a POST request to save the bill
      const response = await axios.post(
        "http://localhost:5000/api/purchase/purchase/savebill",
        data
      );

      // Log the response after saving
      console.log("Bill saved successfully:", response.data);

      const vendorName = response.data.vendorName; // Assuming the response contains the supplier ID

      if (parseFloat(data.total) > 0) {
        // If there is a paid amount, update the supplier's debit balance
        await axios.post("http://localhost:5000/api/supplier/supplier/debit", {
          vendorName,
          amount: parseFloat(data.paidAmount),
        });
      } else {
        // If there is no paid amount, update the supplier's credit balance
        await axios.post("http://localhost:5000/api/supplier/supplier/credit", {
          vendorName,
          amount: parseFloat(data.balance),
        });
      }
      // Reset the form and item list after saving
      setFormData({
        billNo: "",
        date: "",
        vendor: "",
        itemName: "",
        quantity: "",
        unit: "",
        pricePerQty: "",
        gst: "",
        gstAmount: "",
        paidAmount: "",
      });
      setItems([]);
      setItemTotals({});
      setGst(0); // Reset the GST amount
      setCurrentItemGst(0); // Reset currentItemGst

      // Show success popup
      setShowSuccessPopup(true);
      // Hide duplicate popup if it was shown before
      setShowDuplicatePopup(false);

      // Automatically close success popup after 3 seconds (adjust duration as needed)
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error saving the bill:",
        error.response ? error.response.data : error.message
      );

      // Show duplicate popup if duplicate bill number error occurs
      if (error.response && error.response.status === 400) {
        setShowDuplicatePopup(true);

        // Automatically close duplicate popup after 3 seconds (adjust duration as needed)
        setTimeout(() => {
          setShowDuplicatePopup(false);
        }, 3000);
      }
      // Hide success popup if it was shown before
      setShowSuccessPopup(false);
    }
  };

  useEffect(() => {
    if (lastItemIndex !== -1) {
      // Initialize itemTotals with empty objects for each item in items array
      const initialItemTotals = items.reduce((totals, item) => {
        totals[item.itemName] = calculateItemTotal(item);
        return totals;
      }, {});
      setItemTotals(initialItemTotals);
      setLastItemIndex(-1); // Reset lastItemIndex
    }
  }, [items, lastItemIndex])

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto bg-white p-8 rounded shadow-md font-sans mt-8">
        <h2 className="text-2xl font-semibold mb-2">Purchase Bill Form</h2>

        {/* Add Item Form */}
        <div className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 p-1 w-full border rounded-md text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Bill Number
              </label>
              <input
                type="text"
                name="billNo"
                value={formData.billNo}
                onChange={handleInputChange}
                className="mt-1 p-1 w-full border rounded-md text-sm"
                required
              />
            </div>
            <div>

              <button
                onClick={() => setIsNewVendorModalOpen(true)}
                className="text-red-700  align-middle bg-red-200 rounded-full px-1 float-right font-bold "
              >
                <FontAwesomeIcon icon={faPlus} className="" />
              </button>
              <label className="block text-sm font-medium text-gray-600">
                Vendor Name
              </label>
              <select
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                className=" p-1 w-full border rounded-md text-sm"
                required
              >
                <option value="" disabled>
                  Select Vendor
                </option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor.vendorName}>
                    {vendor.vendorName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {showSuccessPopup && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-green-100 border border-green-400 rounded shadow-md z-10">
                  <p className="text-green-700">Bill saved successfully!</p>
                </div>
              )}

              {showDuplicatePopup && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-red-100 border border-red-400 rounded shadow-md z-10">
                  <p className="text-red-700">
                    Duplicate bill number! Please choose a different bill
                    number.
                  </p>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-600">
                Product Name
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="text-red-700 align-middle bg-red-200 rounded-full px-1 float-right font-bold "
                >
                  <FontAwesomeIcon icon={faPlus} className="" />
                </button>

              </label>
              <select
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                className="mt-1 p-1 w-full border rounded-md text-sm"
                required
              >
                <option value="" disabled>
                  Select Product
                </option>
                {sortedProducts.map((product) => (
                  <option key={product._id} value={product.itemName}>
                    {product.itemName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Stock Quantity
              </label>
              <input
                type="text"
                value={stockQty}
                className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Quantity
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="mt-1 p-1 w-full border rounded-md text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Unit Name
                <button
                  onClick={() => setIsNewUnitModalOpen(true)}
                  className="text-red-700 align-middle bg-red-200 rounded-full px-1 float-right font-bold "
                >
                  <FontAwesomeIcon icon={faPlus} className="" />
                </button>

              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="mt-1 p-1 w-full border rounded-md text-sm"
                required
              >
                <option value="" disabled>
                  Select Unit
                </option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit.unit}>
                    {unit.unit}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Price Per Unit
              </label>
              <input
                type="text"
                name="pricePerQty"
                value={formData.pricePerQty}
                onChange={handleInputChange}
                className="mt-1 p-1 w-full border rounded-md text-sm"
                required
              />
            </div>
            <div>
              GST
              <button
                onClick={() => setIsNewGstModalOpen(true)}
                className="text-red-700 align-middle bg-red-200 rounded-full px-1 float-right font-bold "
              >
                <FontAwesomeIcon icon={faPlus} className="" />
              </button>
              <select
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                className="mt-1 p-1 w-full border rounded-md text-sm"
                required
              >
                <option value="" disabled>
                  Select GST
                </option>
                {gsts.map((gst) => (
                  <option key={gst._id} value={gst.gstPercentage}>
                    {gst.gstPercentage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                GST Amount
              </label>
              <input
                type="text"
                value={currentItemGst.toFixed(2)}
                className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Total for {formData.itemName}
              </label>
              <input
                type="text"
                value={
                  itemTotals[formData.itemName]
                    ? itemTotals[formData.itemName].toFixed(2)
                    : "0.00"
                }
                className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100"
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={handleAddItem}
              className=" bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full mt-4 w-72 mx-auto"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Display Added Items */}
        <div className=" mx-auto lg:p-8 lg:-mt-8 md:p-8 p-0 font-sans lg:flex ">
          <div className=" overflow-x-auto flex-col flex overflow-y-auto h-auto">
            <table className="w-full">
              <thead className="text-sm bg-zinc-100 text-yellow-600 border">
                <tr>
                  <th className="p-3 text-left text-gray lg:pl-4 pl-4  whitespace-nowrap">
                    Sr No.
                  </th>
                  <th className="p-3 text-left text-gray lg:pl-4 pl-4 whitespace-nowrap">
                    Item Name
                  </th>
                  <th className="p-3 text-left text-gray lg:pl-4 pl-4 whitespace-nowrap">
                    Quantity
                  </th>
                  <th className="p-3 text-left text-gray lg:pl-4 pl-4 whitespace-nowrap">
                    Unit
                  </th>
                  <th className="p-3 text-left text-gray lg:pl-4 pl-4 whitespace-nowrap">
                    Price Per Qty
                  </th>
                  <th className="p-3 text-left text-gray lg:pl-4 pl-4 whitespace-nowrap">
                    GST
                  </th>
                  <th className="p-3 text-left text-gray lg:pl-4 pl-4 whitespace-nowrap">
                    Total
                  </th>
                  <th className="p-3 text-center whitespace-nowrap">Actions</th>
                  {/* New column for total */}
                  {/* Add more columns for other item details */}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-1 text-left text-gray lg:pl-4 pl-4">
                      {index + 1}
                    </td>
                    <td className="p-1 text-left text-gray lg:pl-4 pl-4">
                      {item.itemName}
                    </td>
                    <td className="p-1 text-left text-gray lg:pl-4 pl-4">
                      {item.quantity}
                    </td>
                    <td className="p-1 text-left text-gray lg:pl-4 pl-4">
                      {item.unit}
                    </td>
                    <td className="p-1 text-left text-gray lg:pl-4 pl-4">
                      {item.pricePerQty}
                    </td>
                    <td className="p-1 text-left text-gray lg:pl-4 pl-4">
                      {item.gst}
                    </td>
                    <td className="p-1 text-left text-gray lg:pl-4 pl-4">
                      {calculateItemTotal(item).toFixed(2)}
                    </td>
                    <td className="p-1 text-center">
                      <button
                        onClick={() => handleEditItem(index)}
                        className="text-gray-600 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md"
                        style={{ background: "#ffff" }}
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          color="orange"
                          className="cursor-pointer"
                        />{" "}
                      </button>

                      <button
                        onClick={() => handleDeleteClick(index)}
                        className="text-gray-600 focus:outline-none font-sans font-medium p-1 rounded-full px-2 text-sm shadow-md"
                        style={{ background: "#ffff" }}
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
                {itemToDeleteIndex !== null && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                      <p>Are you sure you want to delete?</p>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleConfirmDelete}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
                        >
                          Yes
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex-1 lg:ml-24 mt-28 lg:mt-0 md:mt-24">
            <div className="flex container">
              {/* SubTotal */}
              <div className="flex-1 mr-2">
                <label className="block text-sm font-medium text-gray-600">
                  SubTotal
                </label>
                <input
                  type="text"
                  value={Object.values(itemTotals)
                    .reduce((total, itemTotal) => total + (itemTotal || 0), 0)
                    .toFixed(2)}
                  className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100"
                  readOnly
                />
              </div>
              <div className=" flex-1 mr-2 ">
                <label className="block text-sm font-medium text-gray-600">
                  Grand Total
                </label>
                <input
                  type="text"
                  value={grandTotal}
                  className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100"
                  readOnly
                />
              </div>

            </div>

            <div className="flex container">
              {/* Discount */}
              <div className="flex-1   mr-2 ">
                <label className="block text-sm font-medium text-gray-600">
                  Discount
                </label>
                <input
                  type="text"
                  name="discount"
                  value={discount}
                  onChange={handleInputChange}
                  className="mt-1 p-1 w-full border rounded-md text-sm"
                />
              </div>
              <div className="flex-1  mr-2">
                <label className="block text-sm font-medium text-gray-600">
                  Balance
                </label>
                <input
                  type="text"
                  // value={(parseFloat(Object.values(itemTotals).reduce((total, itemTotal) => total + (itemTotal || 0), 0).toFixed(2)) - parseFloat(formData.discount || 0) - parseFloat(formData.paidAmount || 0)).toFixed(2)}
                  value={(
                    parseFloat(grandTotal) - parseFloat(formData.paidAmount || 0)
                  ).toFixed(2)}
                  className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100"
                  readOnly
                />
              </div>
            </div>

            {/* Balance */}
            <div className="flex container">

              <div className=" flex-1 mr-2">
                <label className="block text-sm font-medium text-gray-600">
                  Paid Amount
                </label>
                <input
                  type="text"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                  className="mt-1 p-1 w-full border rounded-md text-sm"
                />
              </div>
            </div>

            {/* Save and Print Button */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleSave}
                className=" bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-1 px-4 rounded-full mt-4  mx-auto"
              >
                Save Bill
              </button>
            </div>
          </div>
        </div>
      </div>
      {showErrorModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto top-36">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal content */}
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    {/* Icon or any visual indication */}
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Not Allowed
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCloseErrorModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNewModalOpen && (
        <div
          className="font-sans fixed inset-0 flex items-center justify-center z-50 m-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <NewItemModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
        </div>
      )}
      {isNewUnitModalOpen && (
        <div
          className="font-sans fixed inset-0 flex items-center justify-center z-50 m-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <NewUnitModal isOpen={isNewUnitModalOpen} onClose={() => setIsNewUnitModalOpen(false)} />
        </div>
      )}
      {isNewGstModalOpen && (
        <div
          className="font-sans fixed inset-0 flex items-center justify-center z-50 m-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <NewGstModal isOpen={isNewGstModalOpen} onClose={() => setIsNewGstModalOpen(false)} />
        </div>
      )}
      {isNewVendorModalOpen && (
        <div
          className="font-sans fixed inset-0 flex items-center justify-center z-50 m-1 bg-black"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <NewVendorModal isOpen={isNewVendorModalOpen} onClose={() => setIsNewVendorModalOpen(false)} />
        </div>
      )}

    </>
  );
};

export default PurchaseForm;
