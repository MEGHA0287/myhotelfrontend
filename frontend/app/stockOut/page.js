"use client";

// components/StockOutwardForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Unit from "../unit/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlus,faTrash,faTimes,faXmark,} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Modal from "react-modal";
import ItemPage from "../itemForm/page";
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

const StockOutwardForm = () => {
  const [waiterName, setWaiterName] = useState("");
  const [productName, setProductName] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [waitersList, setWaitersList] = useState([]);
  const [stockOutwardList, setStockOutwardList] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [unit, setUnit] = useState(""); // Add unit state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [insufficientStockPopup, setInsufficientStockPopup] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);


  const router = useRouter();
  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);

  const openInsufficientStockPopup = () => {
    setInsufficientStockPopup(true);

    // Set a timer to close the popup after 2 seconds
    setTimeout(() => {
      setInsufficientStockPopup(false);
    }, 2000);
  };

  const closeInsufficientStockPopup = () => {
    setInsufficientStockPopup(false);
  };

  const openProductModal = () => {
    setIsProductModalOpen(true);
  };

  // Function to close the GST form modal
  const closeProductModal = () => {
    setIsProductModalOpen(false);
  };

  const handleAddItems = async () => {
    try {
      if (parseInt(stockQty, 10) <= 0) {
        // Display an error message or handle the case of zero or negative quantity
        console.error('Quantity must be a positive number');
        return;
      }
      if (parseInt(stockQty, 10) > availableQuantity) {
        // Display an error message or handle the insufficient stock case
        // console.error('Insufficient stock quantity');
        openInsufficientStockPopup(); // Open the pop-up
        return;
      }

      // Make an API call to add items to stock outward entries
      await axios.post("http://localhost:5000/api/stockOut/stockOut/addItems", {
        waiterName,
        productName,
        stockQty,
        availableQuantity,
      });

      // Make an API call to update available quantity
      await axios.post("http://localhost:5000/api/item/items/updateQuantity", {
        productName,
        stockQty,
      });

      // After adding items and updating available quantity, fetch the updated lists
      await fetchStockOutwardList();
      await fetchProductNames();

      // Clear the input fields
      setWaiterName("");
      setProductName("");
      setStockQty("");
      setMobileNumber("");
      setUnit("");
    } catch (error) {
      console.error(
        "Error adding items:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    try {
      if (name === "waiterName") {
        setWaiterName(value);
        const response = await axios.get(
          `http://localhost:5000/api/waiter/waiter/mobile?name=${value}`
        );
        setMobileNumber(response.data.mobileNumber);
      } else if (name === "productName") {
        setProductName(value);
        const response = await axios.get(
          `http://localhost:5000/api/item/items/quantity?productName=${value}`
        );
        setAvailableQuantity(response.data.availableQuantity);
        setUnit(response.data.unit); // Set unit
      } else if (name === "stockQty") {
        setStockQty(value);
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const fetchProductNames = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/item/items");
      setProductNames(response.data);
    } catch (error) {
      console.error(
        "Error fetching product names:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchStockOutwardList();
    fetchWaitersList();
    fetchProductNames();
  }, []);

  const fetchStockOutwardList = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/stockOut/stockOut"
      );
      setStockOutwardList(response.data);
    } catch (error) {
      console.error(
        "Error fetching stock outward list:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const fetchWaitersList = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/waiter");
      setWaitersList(response.data);
    } catch (error) {
      console.error(
        "Error fetching waiters list:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchStockOutwardList();
    fetchWaitersList();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto bg-white p-2 rounded shadow-md font-sans mt-12">
        <h2 className="text-xl font-semibold mb-3">Stock Outward Form</h2>

        {insufficientStockPopup && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white border border-red-500 rounded p-7 shadow-md z-50 absolute">
              <p className="text-red-500 font-semibold text-center text-xl">
                Insufficient stock quantity!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-600">
              Waiter Name
            </label>
            <select
              name="waiterName"
              value={waiterName}
              onChange={handleInputChange}
              className="mt-1 p-1 w-full border rounded-md text-sm"
              required
            >
              <option value="" disabled>
                Select Waiter
              </option>
              {waitersList.map((waiter) => (
                <option key={waiter._id} value={waiter.waiterName}>
                  {waiter.waiterName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-600">
              Mobile Number
            </label>
            <input
              type="text"
              name="mobileNumber"
              value={mobileNumber}
              className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100"
              readOnly
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="mb-2">
            
            <label className="block text-sm font-medium text-gray-600">
            <div className="relative">
              <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="text-red-700 align-middle bg-red-200 rounded-full px-1 float-right font-bold "
                >
                  <FontAwesomeIcon icon={faPlus} className="" />
                </button>
              </div>
              Product Name
              
            </label>
            <select
              name="productName"
              value={productName}
              onChange={handleInputChange}
              className="mt-1 p-1 w-full border rounded-md text-sm"
              required
            >
              <option value="" disabled>
                Select Product
              </option>
              {productNames.map((productName) => (
                <option key={productName._id} value={productName.itemName}>
                  {productName.itemName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-600">
              Required Quantity
            </label>
            <input
              type="number"
              name="stockQty"
              value={stockQty}
              onChange={handleInputChange}
              className="mt-1 p-1 w-full border rounded-md text-sm"
              required
              min={0}
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-600">
              Available Quantity
            </label>
            <input
              type="text"
              name="availableQuantity"
              value={`${availableQuantity} ${unit}`}
              className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100"
              readOnly
            />
            {/* <span className="mt-1 p-1 w-full border rounded-md text-sm bg-gray-100">{unit}</span> */}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-gray font-semibold p-2 px-4 rounded-full mt-4 w-72 mx-auto"
            onClick={handleAddItems}
          >
            Add Item
          </button>
        </div>

        <div className="max-h-80 custom-scrollbars overflow-y-auto mt-4">
          <table className="w-full border-collapse ">
            <thead className="text-sm bg-zinc-100 text-yellow-600 border">
              <tr className="bg-gray-200 ">
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                  SR No.
                </th>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                  Waiter Name
                </th>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                  Product Name
                </th>
                <th className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 pl-4">
                  Stock Taken
                </th>
                <th className="p-1 whitespace-nowrap text-center text-gray lg:pl-6 pl-4">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {stockOutwardList.map((entry, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 text-sm">
                    {index + 1}
                  </td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 text-sm">
                    {entry.waiterName}
                  </td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 text-sm">
                    {entry.productName}
                  </td>
                  <td className="p-1 whitespace-nowrap text-left text-gray lg:pl-6 text-sm">
                    {entry.stockQty}
                  </td>
                  <td className="p-1 whitespace-nowrap text-center text-gray lg:pl-6 text-sm">
                    {new Date(entry.date).toLocaleString("en-GB", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                      hour12: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isNewModalOpen && (
        <div
          className="font-sans fixed inset-0 flex items-center justify-center z-50 m-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <NewItemModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
        </div>
      )}
    </>
  );
};

export default StockOutwardForm;