"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleMinus } from "@fortawesome/free-solid-svg-icons";

const calculateUpdatedACPercentageAmount = (
  isACEnabled,
  acPercentageAmount,
  acPercentage,
  currentOrder,
  sectionACPercentage
) => {
  if (
    isACEnabled &&
    (!acPercentageAmount || acPercentageAmount === 0) &&
    currentOrder
  ) {
    const acPercentageDecimal = sectionACPercentage / 100;
    return calculateTotal(currentOrder).subtotal * acPercentageDecimal;
  } else {
    return acPercentageAmount;
  }
};

const EditOrderPage = ({ params, tableId }) => {
  const { orderNumber } = params;
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const searchInputRef = useRef(null);
  const [isACEnabled, setIsACEnabled] = useState(true);
  const [isGSTEnabled, setIsGSTEnabled] = useState(true); // State for enabling/disabling GST
  const [order, setOrder] = useState(null);
  const [acPercentage, setACPercentage] = useState(0);
  const [acPercentageAmount, setACPercentageAmount] = useState(0);
  const [tableInfo, setTableInfo] = useState({ tableName: "", totalAmount: 0 });
  const menuItemRefs = useRef([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  const handleToggle = () => {
    setIsMobile(!isMobile);
  };


  const router = useRouter();

  const [greetings, setGreetings] = useState([]);
  useEffect(() => {
    const fetchGreetings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/greet/greet"
        );
        setGreetings(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching greetings:", error);
      }
    };

    fetchGreetings();
  }, []);


  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        if (orderNumber) {
          console.log(orderNumber);
          const orderResponse = await axios.get(
            `http://localhost:5000/api/order/get/order/${orderNumber}`
          );
          const orderData = orderResponse.data;
          console.log(orderData);
          // Fetch the tableId from the order data
          const tableId = orderData.tableId;

          // Fetch the section information based on the tableId
          const sectionResponse = await axios.get(
            `http://localhost:5000/api/section/sectionlist/${tableId}`
          );
          const sectionInfo = sectionResponse.data;

          // Set the AC percentage based on the section information
          const fetchedACPercentage = sectionInfo.acPercentage;
          setACPercentage(fetchedACPercentage);

          // Set the AC percentage amount based on order data
          // Inside the fetchOrderData function
          const fetchedACPercentageFromOrder =
            orderData.acPercentageAmount || sectionInfo.acPercentage || 0;
          setACPercentageAmount(fetchedACPercentageFromOrder);
          setIsACEnabled(fetchedACPercentageFromOrder > 0);

          // Set the initial state of currentOrder with items from the fetched order
          if (orderData.items) {
            setCurrentOrder(orderData.items);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    fetchOrderData();
  }, [orderNumber]);

  // Search filter
  const filterMenus = (menu) => {
    const searchTerm = searchInput.toLowerCase().trim();

    // If the search term is empty, show all menus
    if (searchTerm === "") {
      return true;
    }

    // Check if the search term is a number
    const searchTermIsNumber = !isNaN(searchTerm);

    // If the search term is a number, filter based on menu's uniqueId
    if (searchTermIsNumber) {
      return menu.uniqueId === searchTerm;
    }

    // Split the search term into words
    const searchLetters = searchTerm.split('');

    // Check if the first letters of both words match the beginning of words in the menu's name
    const firstAlphabetsMatch = searchLetters.every((letter, index) => {
      const words = menu.name.toLowerCase().split(' ');
      const firstAlphabets = words.map((word) => word[0]);
      return firstAlphabets[index] === letter;
    });

    // Check if the full search term is included in the menu's name
    const fullWordIncluded = menu.name.toLowerCase().includes(searchTerm);

    return firstAlphabetsMatch || fullWordIncluded;
  };


  const addToOrder = useCallback(
    (product) => {
      setCurrentOrder((prevOrder) => {
        const existingItem = prevOrder.find(
          (item) => item.name === product.name
        );

        if (existingItem) {
          const updatedOrder = prevOrder.map((item) =>
            item.name === existingItem.name
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          return updatedOrder;
        } else {
          return [...prevOrder, { ...product, quantity: 1 }];
        }
      });
    },
    [setCurrentOrder]
  );

  const removeFromOrder = (product) => {
    setCurrentOrder((prevOrder) => {
      const existingItem = prevOrder.find((item) => item.name === product.name);

      if (existingItem) {
        const updatedOrder = prevOrder.map((item) =>
          item.name === existingItem.name
            ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 0 }
            : item
        );

        const filteredOrder = updatedOrder.filter((item) => item.quantity > 0);

        return filteredOrder;
      } else {
        return prevOrder;
      }
    });
  };



  const handleSaveBill = async () => {
    try {
      // Fetch the initial order data
      const initialOrderResponse = await axios.get(`http://localhost:5000/api/order/get/order/${orderNumber}`);
      const initialOrderData = initialOrderResponse.data;

      // Log the initial state of the order before any updates
      await axios.post(`http://localhost:5000/api/logHistory/log-history`, {
        orderNumber: orderNumber,
        updatedBy: "user", // Replace with actual user information
        timestamp: new Date(),
        updatedFields: initialOrderData,
      });

      // Continue with the rest of the code

      // Construct the API endpoint for updating the order based on order number
      const updateOrderEndpoint = `http://localhost:5000/api/order/update-order-by-number/${orderNumber}`;

      // Use the tableId from the order data
      const orderDataToUpdate = {
        tableId: initialOrderData.tableId,
        items: currentOrder.map((orderItem) => ({
          name: orderItem.name,
          quantity: orderItem.quantity,
          price: orderItem.price,
        })),
        subtotal: calculateTotal(currentOrder).subtotal,
        CGST: calculateTotal(currentOrder).CGST,
        SGST: calculateTotal(currentOrder).SGST,
        acPercentageAmount: calculateUpdatedACPercentageAmount(isACEnabled, acPercentageAmount, acPercentage, currentOrder),
        total: calculateTotal(currentOrder).total,
        isTemporary: true, // Set isTemporary to false explicitly
        isPrint: 1,
      };

      // Keep track of stock quantity changes locally
      const stockChanges = {};

      // Update the stockChanges object with the changes
      for (const orderItem of orderDataToUpdate.items) {
        // Check if the item is in the stockChanges object
        if (!(orderItem.name in stockChanges)) {
          stockChanges[orderItem.name] = 0; // Initialize if not present
        }

        // Increase or decrease stock quantity based on item quantity change
        const initialQuantity = initialOrderData.items.find(item => item.name === orderItem.name)?.quantity || 0;
        const quantityChange = orderItem.quantity - initialQuantity;
        stockChanges[orderItem.name] += quantityChange;
      }

      // Update stockChanges object with the changes
      for (const productName in stockChanges) {
        const stockQtyChange = stockChanges[productName];

        // Display popup if there's insufficient stock
        if (stockQtyChange < 0) {
          // Set state to display popup with productName
          setShowPopup(true);
          setProductName(productName);
          return;
        }
      }

      // Update the order based on the order number
      await axios.patch(updateOrderEndpoint, orderDataToUpdate);

      // Log the updated state of the order after updates
      await axios.post(`http://localhost:5000/api/logHistory/log-history`, {
        orderNumber: orderNumber,
        updatedBy: "user", // Replace with actual user information
        timestamp: new Date(),
        updatedFields: orderDataToUpdate,
      });

      // Remove the local storage item for the specific table
      localStorage.removeItem(`savedBills_${orderDataToUpdate.tableId}`);
      console.log("Updated Order Data:", orderDataToUpdate);

      // Redirect to the bill page
      router.push("/order");

      // ... (rest of the code remains unchanged)
    } catch (error) {
      console.error("Error preparing order:", error);
      const productNameMatch = /Insufficient stock for item (.*)/.exec(error.response?.data?.error);
      const productName = productNameMatch ? productNameMatch[1] : "Unknown Product";

      // Set state to display popup with productName
      setShowPopup(true);
      setProductName(productName);
    }
  };


  useEffect(() => {
    if (tableId) {
      axios
        .get(`http://localhost:5000/api/table/tables/${tableId}`)
        .then((response) => {
          setTableInfo(response.data);
        })
        .catch((error) => {
          console.error("Error fetching table information:", error);
        });
    }
  }, [tableId]);

  const handleOrderClick = (order) => {
    if (order.orderNumber) {
      setSelectedOrder(order);
      setCurrentOrder(order.items || []);

      // Redirect to the edit page with the selected order ID
      const orderNumber = order.orderNumber;
      console.log(orderNumber);
      router.push(`/edit/${orderNumber}`);
    } else {
      console.error("Order Number is undefined");
      // Handle the error or provide feedback to the user
    }
  };

  useEffect(() => {
    const handlePageUpKey = (event) => {
      if (event.key === "PageUp") {
        event.preventDefault();
        handleSaveBill(); // Call your function here
      }
    };

    document.addEventListener("keydown", handlePageUpKey);

    return () => {
      document.removeEventListener("keydown", handlePageUpKey);
    };
  }, [handleSaveBill]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        // Redirect to the dashboard or any desired location
        router.push("/bill");
      }
    },
    [router]
  );

  const handleSearchInputKeyDown = (event) => {
    if (event.key === "+") {
      event.preventDefault();
      // Set focus on the first menu item
      if (menuItemRefs.current.length > 0) {
        menuItemRefs.current[0].focus();
      }
    }
  };

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handlePrintBill = async () => {
    try {
      // Fetch the initial order data
      const initialOrderResponse = await axios.get(
        `http://localhost:5000/api/order/get/order/${orderNumber}`
      );
      const initialOrderData = initialOrderResponse.data;

      // Log the initial state of the order before any updates
      await axios.post(`http://localhost:5000/api/logHistory/log-history`, {
        orderNumber: orderNumber,
        updatedBy: "user", // You can replace this with the actual user information
        timestamp: new Date(),
        updatedFields: initialOrderData,
      });

      // Continue with the rest of the code

      // Fetch the order again if needed
      const orderResponse = await axios.get(
        `http://localhost:5000/api/order/get/order/${orderNumber}`
      );
      const orderData = orderResponse.data;
      console.log("Order data after fetching:", orderData);

      // Fetch the tableId from the order data
      const tableId = orderData.tableId;
      const tableResponse = await axios.get(
        `http://localhost:5000/api/table/tables/${tableId}`
      );
      const tableInfo = tableResponse.data;

      // Construct the API endpoint for updating the order based on order number
      const updateOrderEndpoint = `http://localhost:5000/api/order/update-order-by-number/${orderNumber}`;

      // Use the tableId from the order data
      const orderDataToUpdate = {
        tableId: tableInfo._id,
        items: currentOrder.map((orderItem) => ({
          name: orderItem.name,
          quantity: orderItem.quantity,
          price: orderItem.price,
        })),
        subtotal: calculateTotal(currentOrder).subtotal,
        CGST: calculateTotal(currentOrder).CGST,
        SGST: calculateTotal(currentOrder).SGST,
        acPercentageAmount: calculateUpdatedACPercentageAmount(
          isACEnabled,
          acPercentageAmount,
          acPercentage,
          currentOrder
        ),
        total: calculateTotal(currentOrder).total,
        isTemporary: true, // Set isTemporary to false explicitly
        isPrint: 1,
      };

      await axios.patch(updateOrderEndpoint, orderDataToUpdate);
      const updatedOrderResponse = await axios.get(
        `http://localhost:5000/api/order/get/order/${orderNumber}`
      );

      const updatedOrderData = updatedOrderResponse.data;

      const printOrderData = {
        hotelInfo: hotelInfo,
        orderNumber: orderNumber,
        tableInfo: tableInfo,
        tableId: tableInfo._id,
        currentOrder: updatedOrderData.items || [],
        calculateTotal: calculateTotal, // Assuming calculateTotal is a function available in your context
        isACEnabled: isACEnabled,
        acPercentageAmount: acPercentageAmount,
        acPercentage: acPercentage,
      };

      // Log the updated state of the order after updates
      await axios.post(`http://localhost:5000/api/logHistory/log-history`, {
        orderNumber: orderNumber,
        updatedBy: "user", // You can replace this with the actual user information
        timestamp: new Date(),
        updatedFields: orderDataToUpdate,
      });

      // Your existing printing logic
      const printContent = preparePrintContent(printOrderData);

      // Write the content to a new window or iframe
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Please allow pop-ups to print the bill.");
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Trigger the print action
      printWindow.print();

      // Close the print window or iframe after printing
      printWindow.close();

      // Remove the local storage item for the specific table
      localStorage.removeItem(`savedBills_${tableId}`);

      // Redirect to the bill page
      router.push("/order");

      // ... (rest of the code remains unchanged)
    } catch (error) {
      console.error("Error preparing order:", error);
      const productNameMatch = /Insufficient stock for item (.*)/.exec(error.response?.data?.error);
      const productName = productNameMatch ? productNameMatch[1] : "Unknown Product";

      // Set state to display popup with productName
      setShowPopup(true);
      setProductName(productName);
    }
  };
  const preparePrintContent = (printOrderData) => {
    const {
      hotelInfo,
      orderNumber,
      tableInfo,
      currentOrder,
      calculateTotal,
      isACEnabled,
      acPercentageAmount,
      acPercentage,
    } = printOrderData;

    // ... (Your existing printing HTML code)

    const printContent = `
      <html>
  <head>
    <title>Bill</title>
    <style>
      @page {
        margin: 2mm; /* Adjust the margin as needed */
      }
      body {
        font-family: 'sans' ; /* Specify a more common Courier font */
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
       
      
      }
      
      .container {
        max-width: 600px;
        padding: 10px 10px;
        justify-content: center;
        align-items: center;
        text-align: center;
        background-color: #fff;
        box-shadow: 0 0 10px black;
      }
      
      .hotel-details p {
        text-align: center;
        margin-top: -10px;
      }
      
      .order_details_border {
        margin-left: 10px;
        position: relative;
        top: 2rem;
      }
      
      .container .total-section {
        justify-content: space-between;
        display: flex;
      }
      
      .margin_left_container {
        margin-left: -2rem;
      }
      
      .container {
        margin: 1rem;
        align-items: center;
        height: fit-content; /* Changed 'fit' to 'fit-content' */
      }
      
      .contact-details p {
        display: inline-block;
      }
      
      .hotel-details {
        text-align: center;
        margin-bottom: -10px;
      }
      
      .hotel-details h4 {
        font-size: 20px;
        margin-bottom: 10px;
      }
      
      .hotel-details .address {
        font-size: 13px;
        margin-bottom: 10px;
      }
      
      .hotel-details p {
        font-size: 12px;
      }
      
      .contact-details {
        align-items: center;
        text-align: center;
        width: 100%;
        display: flex;
        font-size: 12px;
        justify-content: space-between;
      }
      
      .bill-no {
        font-size: 12px;
        border-top: 1px dotted gray;
      }
      
      .tableno p {
        font-size: 15px;
      }
      
      .waiterno p {
        font-size: 12px;
      }
      
      .tableAndWaiter {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px dotted gray;
      }
      
      .waiterno {
        /* Missing 'display: flex;' */
        display: flex;
      }
      
      .order-details table {
        border-collapse: collapse;
        width: 100%;
        border-top: 1px dotted gray;
      }
      
     
    .order-details{
     margin-top:-14px

    } 

         

      .order-details th {
        padding: 8px;
        text-align: left;
        border-top: 1px dotted gray;
      }
      
      .order-details td,
      .order-details th {
        border-bottom: none;
        text-align: left;
        padding: 4px;
      }
      
      .menu-name {
        white-space: nowrap;
      }
      
      .margin_left_container {
        margin-left: 20px;
      }
      
      .thdots {
        border-top: 1px dotted gray;
        padding-top: 2px;
      }
      
      .itemsQty {
        border-top: 1px dotted gray;
        margin-top: 5px;
        margin-bottom: 5px;
      }
      
      .itemsQty p {
        margin-top: 2px;
      }
      
      .subtotal,
      .datas {
        margin-top: 22px;
      }
      
      .datas {
        text-align: right;
      }
      
      .subtotal p {
        margin-top: -16px;
      }
      
      .datas p {
        margin-top: -16px;
      }
      
      .subtotalDatas {
        display: flex;
        border-top: 1px dotted gray;
        justify-content: space-between;
        margin-top: -9px;
      }
      
      .grandTotal {
        font-size: 22px;
      }
      
      .totalprice {
        text-align: right;
      }
      
      .table-class th {
        font-weight: 400;
      }
      
      .table-class th {
        align-items: center;
        text-align: center;
      }
      
      .tableAndWaiter p {
        margin-top: -10px;
      }
      
      .billNo {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: space-between;
      }
      
      .billNo p {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: space-between;
      }
      
      .footer {
        border-top: 1px dotted gray;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-top: -3rem;
      }
      
      .footer p {
        margin-top: 7px;
      }
      
      .datetime-containers {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px; /* Adjust the margin as needed */
      }
      
      .label {
        margin-top: -25px;
      }
      
      .datetime-containers p {
        font-size: 10px;
        margin: 0; /* Remove default margin for paragraphs inside .datetime-containers */
      }
      
      .label {
        margin-top: -25px;
      }
      
      .footerss {
        margin-top: 25px;
      }
      
      .order-details {
        min-height: 70px; /* Set a minimum height as needed */
       
      }
      
      .tableAndWaiter {
        margin-top: -7px;
      }
      
      .tableno {
        border-top: 1px dotted gray;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .tableno p{
        margin-top:4px
      }
      /* Align the Price column to the right */
      .table-class th:nth-child(4),
      .table-class td:nth-child(4) {
        text-align: right;
      }
      
      /* Center the SR column */
      .table-class th:nth-child(1),
      .table-class td:nth-child(1) {
        text-align: center;
      }
      
      /* Set a fixed width for the SR and Price columns if needed */
      .table-class th:nth-child(1),
      .table-class td:nth-child(1),
      .table-class th:nth-child(4),
      .table-class td:nth-child(4) {
        width: 50px; /* Adjust the width as needed */
      }
      
   
      
  </style>
        </head>
        <body>
        <!-- Hotel Details Section -->
        <div class="hotel-details">
          <h4>${hotelInfo ? hotelInfo.hotelName : "Hotel Not Found"}</h4>
          <p class="address">${hotelInfo ? hotelInfo.address : "Address Not Found"
      }</p>
          <p>Phone No: ${hotelInfo ? hotelInfo.contactNo : "Mobile Not Found"
      }</p>
          ${hotelInfo && hotelInfo.gstNo
        ? `<p>GSTIN: ${hotelInfo.gstNo}</p>`
        : ""
      }
  ${hotelInfo && hotelInfo.sacNo ? `<p>SAC No: ${hotelInfo.sacNo}</p>` : ""}
  ${hotelInfo && hotelInfo.fssaiNo
        ? `<p>FSSAI No: ${hotelInfo.fssaiNo}</p>`
        : ""
      }
        </div>
      
        <!-- Content Section -->
        <div class="content">
          <!-- Add your content here -->
        </div>
      
        <!-- Table and Contact Details Section -->
        <div class="tableno">
          <div class="billNo">
            <p>Bill No: ${orderNumber}</p>
          </div>
          <p class="numberstable">Table No: ${tableInfo ? tableInfo.tableName : "Table Not Found"
      }</p>
        </div>
        <div class="contact-details">
          <!-- Add your contact details here -->
        </div>
      
        <!-- Date and Time Containers Section -->
        <div class="datetime-containers">
          <span class="label">Date: <span id="date" class="datetime"></span></span>
          <span class="datetime-space"></span>
          <span class="label">Time: <span id="time" class="datetime"></span></span>
        </div>
      
        <!-- Order Details Section -->
        <div class="order-details reduced-margin">
          <table class="table-class">
            <thead>
              <tr>
                <th>SR</th>
                <th>Items</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${currentOrder.map(
        (orderItem, index) => `<tr key=${orderItem._id}>
                  <td>${index + 1}</td>
                  <td class="menu-name">${orderItem.name}</td>
                  <td>${orderItem.quantity}</td>
                  <td class="totalprice">${(
            orderItem.price * orderItem.quantity
          ).toFixed(2)}</td>
                </tr>`
      ).join('')}
            </tbody>
          </table>
        </div>
      
        <!-- Items Quantity Section -->
        <div class="itemsQty">
          <p>Total Items: ${calculateTotal(currentOrder).totalQuantity}</p>
        </div>

        <!-- AC Section (Display only if acPercentage > 0) -->
${acPercentage > 0 ? `
    <div class="margin_left_container">
        <!-- Include content or styling for AC section if needed -->
    </div>
    <div class="datas">
        <!-- Include content or styling for AC section if needed -->
    </div>
` : ''}
     
<!-- Subtotal Data Section -->
<div class="subtotalDatas">
    <div class="subtotal">
        <p>Subtotal: </p>
        ${acPercentageAmount ? `<p>AC (${acPercentage}%)</p>` : ""}
        ${hotelInfo && hotelInfo.gstPercentage > 0
        ? `<p>CGST (${hotelInfo.gstPercentage / 2}%)</p> <p>SGST (${hotelInfo.gstPercentage / 2}%)</p>`
        : ""
      }
        <p class="grandTotal">Grand Total: </p>
    </div>

    <div class="datas">
        <!-- Include content or styling for AC section if needed -->
        <p>${calculateTotal(currentOrder).subtotal}</p>
        ${acPercentage > 0 ? `<p>${acPercentageAmount}</p>` : ""}
        ${hotelInfo && hotelInfo.gstPercentage > 0
        ? `<p>${calculateTotal(currentOrder).CGST}</p><p>${calculateTotal(currentOrder).SGST}</p>`
        : ""
      }
        <p class="grandTotal">${Math.round(calculateTotal(currentOrder).total)}</p>
    </div>
</div>
      
         <!-- Footer Section -->
        <div class="footerss">
  <div class="footer">
    <p>
      <span class="big-text">
        ${greetings.map((index) => {
        return `<span class="">
            ${index.greet}
          </span>
          <span style="${index.message ? "" : "display: none;"}">
            ${index.message}
          </span>`;
      })}<br>
        <span class="small-text">AB Software Solution: 8888732973</span>
      </span>
   
    </p>
  </div>
      
        <script>
  // JavaScript to dynamically update date and time
  function updateDateTime() {
    const dateElement = document.getElementById('date');
    const timeElement = document.getElementById('time');
    const now = new Date();
    
    // Format date as dd/mm/yyyy
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = now.getFullYear();
    const formattedDate = day + '/' + month + '/' + year;

    // Format time as hh:mm:ss
    const options = { hour: 'numeric', minute: 'numeric' };
    const formattedTime = now.toLocaleTimeString('en-US', options);

    // Update the content of the elements
    dateElement.textContent = formattedDate;
    timeElement.textContent = formattedTime;
  }

  // Call the function to update date and time
  updateDateTime();

  // Optionally, you can update the date and time every second
  setInterval(updateDateTime, 1000);
</script>
        
      </body>
</html>
`;

    return printContent;
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/main")
      .then((response) => {
        console.log(response.data);
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    axios
      .get("http://localhost:5000/api/menu/menus/list")
      .then((response) => {
        const menusArray = response.data;
        setMenus(menusArray);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // Fetch categories
    axios
      .get("http://localhost:5000/api/main")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    // Fetch products
    axios
      .get("http://localhost:5000/api/menu/menus/list")
      .then((response) => {
        console.log(response.data);
        const menusArray = response.data; // Ensure menus is an array
        setMenus(menusArray);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });

    if (tableId) {
      axios
        .get(`http://localhost:5000/api/table/tables/${tableId}`)
        .then((response) => {
          setTableInfo(response.data);
        })
        .catch((error) => {
          console.error("Error fetching table information:", error);
        });
    }

    const savedBills =
      JSON.parse(localStorage.getItem(`savedBills_${tableId}`)) || [];
    if (savedBills.length > 0) {
      // Assuming you want to load the latest saved bill
      const latestOrder = savedBills[savedBills.length - 1];
      setCurrentOrder(latestOrder.items || []); // Initialize currentOrder with the saved items
    }

    document.addEventListener("keydown", handleKeyDown);
    // document.addEventListener('keydown', handleSlashKey);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // document.removeEventListener('keydown', handleSlashKey);
    };
  }, [tableId, handleKeyDown]);

  useEffect(() => {
    const handleStarKey = (event) => {
      if (event.key === "*") {
        event.preventDefault();
        handlePrintBill();
      }
    };
    document.addEventListener("keydown", handleStarKey);
    return () => {
      document.removeEventListener("keydown", handleStarKey);
    };
  }, [handlePrintBill]);



  useEffect(() => {
    // Fetch menus based on the selected category
    if (selectedCategory) {
      axios
        .get(`http://localhost:5000/api/menu/${selectedCategory._id}`)
        .then((response) => {
          console.log(response.data);
          const menusArray = response.data || []; // Ensure menus is an array
          setMenus(menusArray);
        })
        .catch((error) => {
          console.error("Error fetching menus:", error);
        });
    }
  }, [selectedCategory]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);

    if (category === null) {
      axios
        .get("http://localhost:5000/api/menu/menus/list")
        .then((response) => {
          setMenus(response.data);
        })
        .catch((error) => {
          console.error("Error fetching menus:", error);
        });
    } else {
      axios
        .get(`http://localhost:5000/api/menu/menulist/${category._id}`)
        .then((response) => {
          setMenus(response.data);
        })
        .catch((error) => {
          console.error("Error fetching menus:", error);
        });
    }
  };

  const calculateTotal = (currentOrder) => {
    if (!currentOrder) {
      return {
        subtotal: 0,
        SGST: 0,
        CGST: 0,
        acAmount: 0,
        total: 0,
        totalQuantity: 0,
      };
    }
    const subtotal = currentOrder.reduce(
      (acc, orderItem) => acc + orderItem.price * orderItem.quantity,
      0
    );

    // No need to calculate GST if it's not enabled
    const GSTRate = isGSTEnabled ? gstPercentage / 100 : 0;

    const CGST = (GSTRate / 2) * subtotal;
    const SGST = (GSTRate / 2) * subtotal;

    // Use acPercentageAmount directly, no need to recalculate
    const acAmount = isACEnabled ? acPercentageAmount || 0 : 0;

    const total = subtotal + CGST + SGST + acAmount;
    const totalQuantity = currentOrder.reduce(
      (acc, orderItem) => acc + orderItem.quantity,
      0
    );

    return {
      subtotal: subtotal.toFixed(2),
      SGST: SGST.toFixed(2),
      CGST: CGST.toFixed(2),
      acAmount: acAmount.toFixed(2),
      total: total.toFixed(2),
      totalQuantity: totalQuantity,
    };
  };

  const handleMenuItemKeyDown = (event, product) => {
    if (event.key === "Enter") {
      addToOrder(product);
    } else if (event.key === "+") {
      event.preventDefault();
      setSearchInput("");

      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else if (event.key === "-") {
      event.preventDefault();
      removeFromOrder(product);
    }
  };

  const [gstPercentage, setGSTPercentage] = useState(0); // Add this line for the GST percentage

  const updateOrderItem = (updatedItem) => {
    setCurrentOrder((prevOrder) =>
      prevOrder.map((item) =>
        item.name === updatedItem.name
          ? { ...item, quantity: updatedItem.quantity }
          : item
      )
    );
    closeEditOrderModal();
  };



  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        // Fetch all hotels
        const allHotelsResponse = await axios.get(
          "http://localhost:5000/api/hotel/get-all"
        );
        const allHotels = allHotelsResponse.data;

        // Assuming you want to use the first hotel's ID (you can modify this logic)
        const defaultHotelId = allHotels.length > 0 ? allHotels[0]._id : null;

        if (defaultHotelId) {
          // Fetch information for the first hotel
          const response = await axios.get(
            `http://localhost:5000/api/hotel/get/${defaultHotelId}`
          );
          const hotelInfo = response.data;

          setHotelInfo(hotelInfo);
          setGSTPercentage(hotelInfo.gstPercentage || 0);
        } else {
          console.error("No hotels found.");
        }
      } catch (error) {
        console.error("Error fetching hotel information:", error);
      }
    };

    fetchHotelInfo();
  }, []); // Empty dependency array ensures the effect runs only once on mount




  const updateOrder = (updatedOrderItem) => {
    setCurrentOrder((prevOrder) => {
      const updatedOrder = prevOrder.map((item) =>
        item.name === updatedOrderItem.name ? updatedOrderItem : item
      );
      return updatedOrder;
    });
  };

  const handleQuantityChange = (e, orderItem) => {
    let newQuantity = e.target.value;

    // Handle backspace
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      newQuantity = newQuantity.slice(0, -1);
    }

    if (newQuantity === "" || isNaN(newQuantity) || newQuantity < 0) {
      newQuantity = "";
    } else {
      newQuantity = parseInt(newQuantity, 10);
    }

    const updatedOrderItem = { ...orderItem, quantity: newQuantity };
    updateOrder(updatedOrderItem);
  };
  const [ProductName, setProductName] = useState("");



  return (
    <div className=" font-sans lg:mt-3 md:mt-0 mt-1 ">

      {showPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-2xl z-50 rounded-lg border border-blue-700">
          <div className="text-center">
            <p className="mb-4">Stock Quantity is not available for <b><i>{ProductName}</i></b>! </p>
            <button
              className=" bg-blue-200  hover:bg-blue-300 text-blue-700 font-bold py-2 px-4 rounded-full mr-2"
              onClick={closePopup}
            >
              Ok
            </button>
          </div>
        </div>
      )}
      {/* <!-- component --> */}
      <div className="container mx-auto  bg-white">
        <div className="flex lg:flex-row  shadow-lg">
          <div className=" w-full lg:w-2/5 bg-gray-100 md:w-96 lg:-mt-3 -mt-2 md:-mt-1">

            {/* <!-- header --> */}
            <div className="flex flex-row items-center justify-center px-2 mt-3">

              <div className="font-bold text-lg ">
                Edit Bill No.{orderNumber}
              </div>
              <div className="md:hidden cursor-pointer mr-20 absolute -right-16 mb-2 rounded-md" onClick={handleToggle}>
                <svg viewBox="0 0 10 8" width="30">
                  <path
                    d="M1 1h8M1 4h 8M1 7h8"
                    stroke="#000000"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            {/* <!-- end header --> */}
            {/* <!-- order list --> */}
            <div className=" ">
              <div className="p-1 mt-3 custom-scrollbars overflow-y-auto lg:h-64 md:h-56 h-52 lg:text-sm md:text-sm text-xs">

                {currentOrder.map((orderItem) => (
                  <div key={orderItem._id} className="flex items-center mb-1">
                    <div className="flex flex-row items-center ">
                      <div className="flex items-center h-full">

                        <span className=" font-semibold  lg:w-52 md:w-44 w-60 sm:text-xs md:text-xs   lg:text-base lg:ml-1 text-sm">
                          {orderItem.name}
                        </span>
                      </div>
                    </div>
                    <div className="float-right flex justify-between md:ml-1 mt-2 lg:ml-10">
                    <span
                            className="rounded-md cursor-pointer  align-middle text-center  
                         font-bold p-1 lg:w-4 lg:text-md md:w-4 sm:w-4 ml-2 lg:mr-5"
                            onClick={() => removeFromOrder(orderItem)}
                          >
                            <FontAwesomeIcon icon={faCircleMinus}
                              size="xl"
                              style={{ color: "#f25236", }} />
                          </span>
                      <input
                        type="number"
                        value={orderItem.quantity}
                        onChange={(e) => handleQuantityChange(e, orderItem)}
                        className="font-semibold lg:w-10 md:w-10 w-10 justify-center flex text-center rounded-md align-center md:text-xs pl-0 mr-1 "
                        min={1}
                      />
                      <span
                        className="rounded-md cursor-pointer  sm:w-4  lg:w-6 justify-center flex align-middle text-center  md:w-4 font-bold lg:ml-1 p-1 sm:p-0 lg:text-md lg:mt-1"
                        onClick={() => addToOrder(orderItem)}
                      >
                        <FontAwesomeIcon icon={faCirclePlus}
                          size="xl"
                          style={{ color: "#f25236", }} />
                      </span>
                    </div>
                    <div className="font-semibold  lg:text-sm float-right md:text-md text-xs mt-1  text-right lg:ml-3  ml-7 lg:mt-0  md:mt-0 sm:mt-0  sm:text-xs sm:w-20 ">
                      {`₹${(orderItem.price * orderItem.quantity)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* <!-- end order list --> */}
            {/* <!-- totalItems --> */}
            <div className="px-5 lg:mt-1 md:mt-10 mt-48 lg:ml-0 md:-ml-1 ml-0 lg:text-sm md:text-sm text-xs sm:ml-2">
              <div className="py-1 rounded-md shadow-md bg-white lg:mt-2 ">
                <div className="px-4 flex justify-between ">
                  <span className="font-semibold text-sm">Subtotal</span>
                  <span className="font-semibold">
                    ₹{calculateTotal(currentOrder).subtotal}
                  </span>
                </div>

                <div className="px-4 flex justify-between ">
                </div>

                {acPercentageAmount > 0 && ( // Render AC Amount section only if AC is enabled
                  <div className="px-4 flex justify-between">
                    <span className="font-semibold text-sm">AC Charges</span>
                    <span className="font-bold">({acPercentage}%) ₹{calculateTotal(currentOrder).acAmount}</span>
                  </div>
                )}

                {isGSTEnabled && gstPercentage > 0 && (
                  <div>
                    <div className="px-4 flex justify-between ">
                      <span className="font-semibold text-sm">CGST</span>
                      <span className="font-semibold">
                        ({gstPercentage / 2}%) ₹{calculateTotal(currentOrder).CGST}
                      </span>
                    </div>
                    <div className="px-4 flex justify-between ">
                      <span className="font-semibold text-sm">SGST</span>

                      <span className="font-semibold">
                        ({gstPercentage / 2}%) ₹{calculateTotal(currentOrder).SGST}
                      </span>
                    </div>
                  </div>
                )}
                <div className="border-t-2 lg:py-2 lg:px-4 py-1 px-1 flex items-center justify-between mt-2">
                  <span className=" font-semibold text-xl lg:text-2xl">
                    Total
                  </span>
                  <span className="font-semibold text-xl lg:text-2xl lg:mr-0 md:mr-2">
                    {/* ₹{(calculateTotal().total)} */}₹
                    {Math.round(calculateTotal(currentOrder).total)}
                  </span>
                  {/* <span className="font-bold text-2xl">₹{Math.ceil(Number(calculateTotal().total)).toFixed(2)}</span> */}
                </div>
                <div className="px-5 text-left text-sm  text-gray-500 font-sans font-semibold -ml-4">
                  Total Items: {calculateTotal(currentOrder).totalQuantity}
                </div>
              </div>
            </div>
            {/* <!-- end total --> */}

            {/* <!-- button pay--> */}
            <div className="flex px-5 mt-2 justify-between">
              <div className=" sm:w-auto mb-2 sm:mb-0 sm:mr-2 ">
                <div
                  className="px-3 py-2 rounded-md shadow-md text-center bg-green-200 text-green-600 font-bold cursor-pointer text-xs"
                  onClick={handlePrintBill}
                >
                  Bill ( * )
                </div>
              </div>

              <div className=" sm:w-auto mb-2 sm:mb-0 sm:mr-2 ">
                <div
                  className="px-3 py-2 rounded-md shadow-md text-center bg-blue-100 text-blue-500 font-bold cursor-pointer text-xs"
                  onClick={handleSaveBill}
                >
                  Save (Pg Up)
                </div>
              </div>
            </div>
          </div>

          {isMobile && (
            <div className=" absolute right-0 top-0 w-80 mt-8 bg-white rounded-md">
              {/* <!-- header --> */}
              <div className="flex flex-row justify-between items-center px-5 mt-1"></div>
              <div className=" flex flex-row px-4 ml-1 lg:-mt-3 custom-scrollbars overflow-x-auto whitespace-nowrap">
                <span
                  key="all-items"
                  className={`cursor-pointer px-2  py-1 mb-1 rounded-2xl text-xs lg:text-sm font-semibold mr-4 ${selectedCategory === null ? "bg-yellow-500 text-white" : ""
                    }`}
                  onClick={() => handleCategoryClick(null)}
                >
                  All Menu
                </span>
                {categories.map((category) => (
                  <span
                    key={category._id}
                    className={`whitespace-nowrap cursor-pointer px-5 py-1 mb-1 rounded-2xl lg:text-sm md:text-sm text-xs  font-semibold ${selectedCategory === category
                      ? "bg-yellow-500 text-white "
                      : ""
                      }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.name}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex justify-start px-5">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Menu / Id..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500 w-18 lg:w-48 md:w-44
                 text-xs -ml-4 lg:ml-0 md:ml-0 lg:text-sm md:text-sm"
                />
              </div>

              <div
                className="cursor-pointer grid grid-cols-3 bg-white md:grid-cols-3  gap-3
               px-2 mt-3 custom-sidescrollbars overflow-scroll max-h-[calc(85vh-1rem)]"
              >
                {(menus.menus || menus)
                  .filter(filterMenus) // Apply the filterMenus function
                  .map((product, index) => (
                    <div
                      key={product._id}
                      className="lg:px-3 lg:py-3 md:px-2 md:py-2 sm:px-2 sm:py-2 px-1 py-1 flex flex-col hover:bg-indigo-100 shadow-md border border-gray-200 rounded-md
                    justify-between text-sm lg:h-32 md:h-20 "
                      onClick={() => addToOrder(product)}
                      tabIndex={0}
                      ref={(el) => (menuItemRefs.current[index] = el)} // Save the ref to the array
                      onKeyDown={(e) => handleMenuItemKeyDown(e, product)} // Handle keydown event
                    >
                      <div>
                        <div className="lg:-mt-3 -mt-1 md:-mt-2">
                          <span className="text-orange-500 md:text-xs text-xs font-semibold lg:text-sm rounded-md overflow-hidden whitespace-nowrap ">
                            {product.uniqueId}
                          </span>
                          <span className="float-right text-green-700 text-xs md:text-xs font-bold lg:text-sm rounded-md overflow-hidden whitespace-nowrap " style={{ fontSize: '12px' }}>
                            ₹{product.price}
                          </span>
                        </div>
                      </div>
                      <div className="">
                        <img
                          src={product.imageUrl ? `http://localhost:5000/${product.imageUrl}` : `/tray.png`}
                          className={`object-cover rounded-md ${product.imageUrl
                            ? 'lg:w-24 lg:h-16 md:w-10 md:h-10 w-8 h-8 lg:mt-1 -mt-4 md:-mt-1 lg:ml-10'
                            : 'lg:w-12 lg:h-10 md:w-7 md:h-7 w-8 h-8 mt-2 md:ml-7 lg:ml-12 '
                            } hidden lg:block`}
                          alt=""
                        />
                      </div>
                      <div className="font-bold text-gray-800 md:mt-1 sm:mt-1 lg:mt-1 lg:flex  justify-between">
                        <span className="md:text-xs sm:text-xs lg:mb-1 flex" style={{ fontSize: '11px' }}>
                          {product.name}
                        </span>
                        <span>
                          {product.stockQty ? (
                            <span className="text-xs px-2 font-bold text-white mt-1 shadow-md bg-orange-500 rounded-full">Q: {product.stockQty}</span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              {/* <!-- end products --> */}
            </div>
          )}{" "}


          <div className=" w-full lg:w-3/5  xl: shadow-lg md:w-96 hidden md:block bg-white">
            {/* <!-- header --> */}
            <div className="flex flex-row justify-between items-center px-5 mt-1"></div>
            <div className=" flex flex-row px-4 ml-1 lg:-mt-3 custom-scrollbars overflow-x-auto whitespace-nowrap">
              <span
                key="all-items"
                className={`cursor-pointer px-2  py-1 mb-1 rounded-2xl text-xs lg:text-sm font-semibold mr-4 ${selectedCategory === null ? "bg-yellow-500 text-white" : ""
                  }`}
                onClick={() => handleCategoryClick(null)}
              >
                All Menu
              </span>
              {categories.map((category) => (
                <span
                  key={category._id}
                  className={`whitespace-nowrap cursor-pointer px-5 py-1 mb-1 rounded-2xl lg:text-sm md:text-sm text-xs  font-semibold ${selectedCategory === category
                    ? "bg-yellow-500 text-white "
                    : ""
                    }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.name}
                </span>
              ))}
            </div>
            <div className="mt-3 flex justify-start px-5">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Menu / Id..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500 w-18 lg:w-48 md:w-44
                 text-xs -ml-4 lg:ml-0 md:ml-0 lg:text-sm md:text-sm"
              />
            </div>

            <div
              className="cursor-pointer grid grid-cols-2 bg-white md:grid-cols-3 lg:grid-cols-4 gap-3
              lg:px-3 md:px-2 px-2 mt-3 custom-sidescrollbars overflow-scroll lg:max-h-[calc(86vh-1rem)]
              md:max-h-[calc(84vh-1rem)]  max-h-[calc(97vh-1rem)] sm:max-h-[calc(80vh-1rem)] "
            >
              {(menus.menus || menus)
                .filter(filterMenus) // Apply the filterMenus function
                .map((product, index) => (
                  <div
                    key={product._id}
                    className="lg:px-3 lg:py-3 md:px-2 md:py-2 sm:px-2 sm:py-2 px-1 py-1 flex flex-col hover:bg-indigo-100 shadow-md border border-gray-200 rounded-md
                    justify-between text-sm lg:h-32 md:h-20 "
                    onClick={() => addToOrder(product)}
                    tabIndex={0}
                    ref={(el) => (menuItemRefs.current[index] = el)} // Save the ref to the array
                    onKeyDown={(e) => handleMenuItemKeyDown(e, product)} // Handle keydown event
                  >
                    <div>
                      <div className="lg:-mt-3 -mt-1 md:-mt-2">
                        <span className="text-orange-500 md:text-xs text-xs font-semibold lg:text-sm rounded-md overflow-hidden whitespace-nowrap ">
                          {product.uniqueId}
                        </span>
                        <span className="float-right text-green-700 text-xs md:text-xs font-bold lg:text-sm rounded-md overflow-hidden whitespace-nowrap " style={{ fontSize: '12px' }}>
                          ₹{product.price}
                        </span>
                      </div>
                    </div>
                    <div className="">
                      <img
                        src={product.imageUrl ? `http://localhost:5000/${product.imageUrl}` : `/tray.png`}
                        className={`object-cover rounded-md ${product.imageUrl
                          ? 'lg:w-24 lg:h-16 md:w-10 md:h-10 w-8 h-8 lg:mt-1 -mt-4 md:-mt-1 lg:ml-10'
                          : 'lg:w-12 lg:h-10 md:w-7 md:h-7 w-8 h-8 mt-2 md:ml-7 lg:ml-12 '
                          } hidden lg:block`}
                        alt=""
                      />
                    </div>
                    <div className="font-bold text-gray-800 md:mt-1 sm:mt-1 lg:mt-1 lg:flex  justify-between">
                      <span className="md:text-xs sm:text-xs lg:mb-1 flex" style={{ fontSize: '11px' }}>
                        {product.name}
                      </span>
                      <span>
                        {product.stockQty ? (
                          <span className="text-xs px-2 font-bold text-white mt-1 shadow-md bg-orange-500 rounded-full">Q: {product.stockQty}</span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            {/* <!-- end products --> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderPage