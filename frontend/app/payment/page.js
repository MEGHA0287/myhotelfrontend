"use client";

// Import necessary modules and components
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const PaymentModal = ({
  onClose,
  tableName,
  totalAmount,
  orderID,
  orderNumber,
  items,
}) => {
  console.log("Items prop in PaymentModal:", items);

  const [formData, setFormData] = useState({
    totalAmount: 0,
    cashAmount: 0,
    dueAmount: 0,
    complimentaryAmount: 0,
    discount: 0,
    onlinePaymentAmount: 0,
    customerName: "",
    mobileNumber: "", // Initialize mobileNumber as an empty string
  });

  const [mobileNumbers, setMobileNumbers] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // State to manage dropdown visibility

  useEffect(() => {
    fetchMobileNumbers();
  }, []);

  const fetchMobileNumbers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/customer/mobile-numbers"
      );
      setMobileNumbers(response.data);
    } catch (error) {
      console.error("Error fetching mobile numbers:", error);
    }
  };

  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => {
        closeModal();
      }, 2000);

      // Cleanup the timer to avoid memory leaks
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  useEffect(() => {
    if (paymentFailed) {
      const timer = setTimeout(() => {
        setPaymentFailed(false);
      }, 2000);

      // Cleanup the timer to avoid memory leaks
      return () => clearTimeout(timer);
    }
  }, [paymentFailed]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      totalAmount,
      onlinePaymentAmount: totalAmount - prevFormData.cashAmount,
    }));
  }, [totalAmount]);

  // const handlePayment = async (e) => {
  //   e.preventDefault();

  //   try {
  //     let existingCustomer = null;

  //     // Check if the customer already exists
  //     const customerResponse = await axios.get(`http://localhost:5000/api/customer/get-customer-by-mobile/${formData.mobileNumber}`);
  //     existingCustomer = customerResponse.data;

  //     if (parseFloat(formData.dueAmount) > 0) {
  //       const updatedCreditBalance = existingCustomer.creditBalance + parseFloat(formData.dueAmount);
  //       console.log('Updated Credit Balance:', updatedCreditBalance);

  //       if (updatedCreditBalance > 0) {

  //         await axios.patch(`http://localhost:5000/api/customer/update-credit-balance/${existingCustomer._id}`, {
  //           creditBalance: updatedCreditBalance,
  //         });
  //       } else {
  //         console.log('Credit balance not updated because it is not more than 0.');
  //         return;
  //       }
  //     } else {
  //       console.log('No due amount to update credit balance.');
  //     }

  //     // Update credit balance or add a new customer
  //     const updatedCreditBalance = existingCustomer.creditBalance + parseFloat(formData.dueAmount);
  //     console.log('Updated Credit Balance:', updatedCreditBalance);

  //     await axios.patch(`http://localhost:5000/api/customer/update-credit-balance/${existingCustomer._id}`, {
  //       creditBalance: updatedCreditBalance,
  //     });

  //     const response = await axios.patch(`http://localhost:5000/api/order/update-order-by-id/${orderID}`, {
  //       ...formData,
  //       orderID,
  //       orderNumber,
  //       customerName: formData.customerName,
  //       mobileNumber: formData.mobileNumber,
  //       cashAmount: formData.cashAmount,
  //       dueAmount: formData.dueAmount,
  //       complimentaryAmount: formData.complimentaryAmount,
  //       onlinePaymentAmount: formData.onlinePaymentAmount,
  //       discount: formData.discount,
  //       totalAmount,
  //       isPrint: 0,
  //       isTemporary: false
  //     });

  //     console.log('Payment successful:', response.data);
  //     // Set paymentSuccess to true when payment is successful
  //     setPaymentSuccess(true);
  //   } catch (error) {
  //     console.error('Error making payment:', error);

  //     if (error.response && error.response.status === 404) {
  //       console.log('Customer not found. Adding a new customer...');
  //       // Proceed to add a new customer
  //       const newCustomer = await addNewCustomer();

  //       // Retry the payment with the newly created customer
  //       await handlePayment(e);
  //     } else {
  //       // Handle other errors
  //       console.error('Server responded with:', error.response ? error.response.data : 'Unknown error');
  //       // Set paymentFailed to true when payment fails
  //       setPaymentFailed(true);
  //     }
  //   }
  // };

  // const addNewCustomer = async () => {
  //   // Add a new customer
  //   const newCustomerResponse = await axios.post('http://localhost:5000/api/customer/customer/list/add-customer', {
  //     customerName: formData.customerName,
  //     mobileNumber: formData.mobileNumber,
  //     creditBalance: parseFloat(formData.dueAmount),
  //   });

  //   return newCustomerResponse.data;
  // };

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      let existingCustomer = null;

      // Check if the customer already exists
      if (formData.mobileNumber) {
        const customerResponse = await axios.get(
          `http://localhost:5000/api/customer/get-customer-by-mobile/${formData.mobileNumber}`
        );
        existingCustomer = customerResponse.data;
      }

      // Check if mobileNumber is provided and there is a due amount
      if (formData.mobileNumber && parseFloat(formData.dueAmount) > 0) {
        // Update credit balance for existing customer
        const updatedCreditBalance = existingCustomer
          ? parseFloat(formData.dueAmount)
          : parseFloat(formData.dueAmount);

        if (updatedCreditBalance > 0) {
          await axios.patch(
            `http://localhost:5000/api/customer/update-credit-balance/${existingCustomer._id}`,
            {
              creditBalance: updatedCreditBalance,
            }
          );
        } else {
          console.log(
            "Credit balance not updated because it is not more than 0."
          );
          return;
        }
      } else {
        console.log(
          "No due amount or mobile number provided. Skipping credit balance update."
        );
      }

      // Update the order without checking for customerName and mobileNumber
      const response = await axios.patch(
        `http://localhost:5000/api/order/update-order-by-id/${orderID}`,
        {
          ...formData,
          items: items, // Pass the items prop properly
          orderID,
          orderNumber,
          customerName: formData.customerName,
          mobileNumber: formData.mobileNumber,
          cashAmount: formData.cashAmount,
          dueAmount: formData.dueAmount,
          complimentaryAmount: formData.complimentaryAmount,
          onlinePaymentAmount: formData.onlinePaymentAmount,
          discount: formData.discount,
          totalAmount,
          isPrint: 0,
          isTemporary: false,
        }
      );

      console.log("Payment successful:", response.data);
      // Set paymentSuccess to true when payment is successful
      setPaymentSuccess(true);
      setTimeout(() => {
        // Hide the success message
        setPaymentSuccess(false);

        // Redirect to the bill page or update this logic based on your routing system
        window.location.href = "/order";
      }, 2000);
    } catch (error) {
      console.error("Error making payment:", error);

      if (error.response && error.response.status === 404) {
        console.log("Customer not found. Adding a new customer...");
        // Proceed to add a new customer
        const newCustomer = await addNewCustomer();

        // Retry the payment with the newly created customer
        await handlePayment(e);
      } else {
        // Handle other errors
        console.error(
          "Server responded with:",
          error.response ? error.response.data : "Unknown error"
        );
        // Set paymentFailed to true when payment fails
        setPaymentFailed(true);
      }
    }
  };

  const addNewCustomer = async () => {
    // Add a new customer

    if (!formData.mobileNumber || formData.mobileNumber.length < 10) {
      console.error(
        "Mobile number should be at least 10 digits. Payment aborted."
      );
      return;
    }

    const newCustomerResponse = await axios.post(
      "http://localhost:5000/api/customer/customer/list/add-customer",
      {
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        creditBalance: parseFloat(formData.dueAmount),
      }
    );
    return newCustomerResponse.data;
  };

  const closeModal = () => {
    setPaymentSuccess(false);
    setPaymentFailed(false);
    onClose();
    // router.push("/bill");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate for alphabets only
    if (name === "customerName" && /[^a-zA-Z\s]/.test(value)) {
      // Display an error or prevent further processing
      console.error(
        "Invalid input: Customer name must contain only alphabets."
      );
      return;
    }
    // Validate mobileNumber for exactly 10 digits
    if (name === "mobileNumber" && value.length > 10) {
      console.error("Invalid input: Mobile number must be a 10-digit number.");
      return;
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Fetch customer details when mobile number changes
    if (name === "mobileNumber") {
      fetchCustomerDetails(value);
    }
  };

  const fetchCustomerDetails = async (mobileNumber) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customer/get-customer-by-mobile/${mobileNumber}`
      );
      const customerData = response.data;

      if (customerData) {
        // Update the customer name if the customer exists
        setFormData((prevFormData) => ({
          ...prevFormData,
          customerName: customerData.customerName,
        }));
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const handleCashAmountChange = (e) => {
    const cashAmount = parseFloat(e.target.value) || 0;
    const dueAmount = parseFloat(formData.dueAmount) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const onlinePaymentAmount =
      formData.totalAmount - (cashAmount + dueAmount + discount);

    setFormData((prevFormData) => ({
      ...prevFormData,
      discount: discount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      dueAmount: dueAmount.toFixed(2),
      onlinePaymentAmount: onlinePaymentAmount.toFixed(2),
    }));
  };
  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    const cashAmount = parseFloat(formData.cashAmount) || 0;
    const dueAmount = parseFloat(formData.dueAmount) || 0;
    const onlinePaymentAmount =
      formData.totalAmount - (cashAmount + dueAmount + discount);

    setFormData((prevFormData) => ({
      ...prevFormData,
      discount: discount.toFixed(2),
      dueAmount: dueAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      onlinePaymentAmount: onlinePaymentAmount.toFixed(2),
    }));
  };

  const handleCashOnlineChange = (e) => {
    const dueAmount = parseFloat(e.target.value) || 0;
    const cashAmount = parseFloat(formData.cashAmount) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const onlinePaymentAmount =
      formData.totalAmount - (cashAmount + dueAmount + discount);

    setFormData((prevFormData) => ({
      ...prevFormData,
      discount: discount.toFixed(2),
      dueAmount: dueAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      onlinePaymentAmount: onlinePaymentAmount.toFixed(2),
    }));
  };
  const handleComplimentaryChange = (e) => {
    const complimentaryAmount = parseFloat(e.target.value) || 0;
    const cashAmount = parseFloat(formData.cashAmount) || 0;
    const dueAmount = parseFloat(formData.dueAmount) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const onlinePaymentAmount =
      formData.totalAmount -
      (cashAmount + dueAmount + complimentaryAmount + discount);

    setFormData((prevFormData) => ({
      ...prevFormData,
      discount: discount.toFixed(2),
      complimentaryAmount: complimentaryAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      dueAmount: dueAmount.toFixed(2),
      onlinePaymentAmount: onlinePaymentAmount.toFixed(2),
    }));
  };
  return (
    <div className="fixed inset-0 p-4">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left  shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ">
          <div className="container mx-auto lg:p-8 md:p-8 p-2">
            <button
              type="button" // Set the type to "button" to prevent form submission
              onClick={closeModal}
              className="absolute top-2 right-6 lg:top-4 lg:right-4 md:top-4 md:right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <h1 className="lg:text-3xl md:text-2xl text-sm font-bold mb-4 justify-center flex">
              Payment for Table {tableName}
            </h1>
            <form onSubmit={handlePayment} className="max-w-md mx-auto">
              <div className="mb-4">
                <input
                  type="hidden"
                  name="tableId"
                  value={formData.tableId}
                  onChange={handleChange}
                  readOnly
                />
              </div>
              <div className="">
                <div className="mb-4 flex justify-center flex-col lg:w-48 md:w-48 w-36 ml-1 lg:ml-1 md:ml-1">
                  <label
                    htmlFor="orderNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Bill Number
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={orderNumber}
                    readOnly
                    className=" p-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="flex lg:justify-between md:justify-between justify-center">
                  <div className="mb-4">
                    <label
                      htmlFor="totalAmount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Total Amount
                    </label>
                    <input
                      type="text"
                      id="totalAmount"
                      name="totalAmount"
                      value={Math.round(totalAmount)}
                      className="lg:w-48 md:w-48 w-36 p-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="totalAmount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Discount
                    </label>
                    <input
                      type="number"
                      id="discount"
                      onChange={handleDiscountChange}
                      className="p-1.5 lg:w-48 md:w-48 w-36  border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
                      placeholder="00"
                      min={0}
                    />
                  </div>
                </div>

                <div className="flex lg:justify-between md:justify-between justify-center">
                  <div>
                    <label
                      htmlFor="mobileNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mobile Number
                    </label>
                    {/* Combined input field and dropdown list for mobile numbers */}
                    <div className="relative">
                      <input
                        type="number"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        autoComplete="off"
                        className=" p-2 border lg:w-48 md:w-48 w-36 border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
                        placeholder="Enter / Select Mobile No"
                        min={0}
                        // onBlur={() => setShowDropdown(false)} // Hide dropdown when input field loses focus
                        // onFocus={() => setShowDropdown(true)} // Show dropdown when input field is focused
                        list="mobileNumberList" // Connect input field with datalist
                      />
                      {/* Datalist for mobile numbers */}
                      <datalist id="mobileNumberList">
                        {mobileNumbers.map((mobile) => (
                          <option key={mobile} value={mobile} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="">
                    <label
                      htmlFor="customerName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Customer Name
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className=" p-1.5 border lg:w-48 md:w-48 w-36 border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
                      min={0}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-center font-bold mb-3">Payment Method</h1>
                <div className="flex  gap-4 md:flex-row justify-center">
                  <div className="flex flex-col items-center mb-2 ">
                    {/* Cash Payment */}
                    <label
                      htmlFor="cash_amount"
                      className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2 "
                    >
                      Cash
                    </label>
                    <input
                      type="number"
                      id="cash_amount"
                      onChange={handleCashAmountChange}
                      min={0}
                      className="bg-gray-50 border border-gray-300 text-gray-900 
                    text-sm rounded-lg focus:ring-blue-500 
                    focus:border-blue-500 block lg:w-24 w-12 md:w-24 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                    dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="00"
                    />
                  </div>

                  <div className="flex flex-col items-center mb-2">
                    <label
                      htmlFor="due_amount"
                      className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2"
                    >
                      Online
                    </label>
                    <input
                      min={0}
                      type="number"
                      id="online_payment"
                      value={`${Math.round(
                        Number(formData.onlinePaymentAmount)
                      )}`}
                      className="bg-gray-50 border border-gray-300 text-gray-900 
                    text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-24 w-12 md:w-24 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                    dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      readOnly
                    />
                  </div>

                  <div className="flex flex-col items-center mb-2">
                    <label
                      htmlFor="online_payment"
                      className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2"
                    >
                      Credit
                    </label>
                    <input
                      min={0}
                      type="number"
                      name="onlinePaymentAmount"
                      id="due_amount"
                      onChange={handleCashOnlineChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 
                    text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-24 w-12 md:w-24 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                    dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="00"
                    />
                  </div>

                  <div className="flex flex-col items-center mb-2">
                    <label
                      htmlFor="complimentary_amount"
                      className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2"
                    >
                      Complimentary
                    </label>
                    <input
                      min={0}
                      type="number"
                      id="complimentary_amount"
                      onChange={handleComplimentaryChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-24 w-12 md:w-24 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="00"
                    />
                  </div>
                </div>
              </div>
              {/*  */}
              <button
                type="submit"
                className="mx-auto block lg:w-96 md:w-96 w-48 lg:py-3 md:py-3 py-1 p-1 bg-green-200 text-green-800 rounded-full focus:outline-none mt-2 font-semibold text-lg hover:bg-green-100"
              >
                Process Payment
                {/* Payment Success Pop-up */}
                {paymentSuccess && (
                  <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-white border border-green-500 rounded p-7 shadow-md z-50 absolute">
                      <p className="text-green-500 font-semibold text-center text-xl">
                        Payment Successful!
                      </p>
                    </div>
                  </div>
                )}
                {/* Payment Failed Pop-up */}
                {paymentFailed && (
                  <div className="fixed inset-0 flex items-center justify-center">
                    <div
                      className="bg-white border border-red-500 rounded p-7 
                  shadow-md z-50 absolute"
                    >
                      <p className="text-red-500 font-semibold text-center text-xl">
                        Payment Failed!
                      </p>
                    </div>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;