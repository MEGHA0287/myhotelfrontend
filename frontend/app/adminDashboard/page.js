

// 'use client'

// // Import necessary modules
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Square from '../components/square';
// import Navbar from '../components/Navbar';
// import Dishes from '../components/Dishes';
// import dynamic from 'next/dynamic';

// // Dynamically import components with { ssr: false }
// const DynamicDonut = dynamic(() => import('../components/Donut'), { ssr: false });
// const DynamicWave = dynamic(() => import('../components/Wave'), { ssr: false });


// // Define the AdminDashboard component
// const AdminDashboard = () => {
//   // State variables
//   const [lowStockItems, setLowStockItems] = useState([]);
//   const [openingBalances, setOpeningBalances] = useState([]);
//   const [itemsWithSameNameAndMenu, setItemsWithSameNameAndMenu] = useState([]); // Add state for the new items



//   // Fetch data on component mount
//   useEffect(() => {
//     const fetchLowStockData = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/item/low-stock');
//         const data = response.data;
//         setLowStockItems(data);
//       } catch (error) {
//         console.error('Error fetching low stock data:', error);
//       }
//     };

//     const fetchOpeningBalances = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/supplier/openingBalances');
//         const data = response.data;
//         setOpeningBalances(data);
//       } catch (error) {
//         console.error('Error fetching opening balances:', error);
//       }
//     };

//     const fetchItemsWithSameNameAndMenu = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/order/itemsWithSameNameAndMenu');
//         const data = response.data;
//         setItemsWithSameNameAndMenu(data);
//       } catch (error) {
//         console.error('Error fetching items with same name and menu:', error);
//       }
//     };

//     fetchLowStockData();
//     fetchOpeningBalances();
//     fetchItemsWithSameNameAndMenu(); // Fetch the new items data
//   }, []);

//   // Return the JSX content
//   return (
//     <>
    
//         <Navbar />
//         <Square />

//         <div className='flex flex-col lg:flex-row '>
//           {/* Donut Chart */}
//           <div className="container mx-auto bg-white shadow-md sm:w-96 md:w-full lg:w-1/3 text-center lg:ml-3.5 rounded-md mb-4 lg:mb-0">
//             {/* Dynamic import for Donut component */}
//             <DynamicDonut />
//           </div>

//           {/* Line Chart */}
//           <div className="container mx-auto bg-white shadow-md sm:w-96 md:w-full lg:w-3/5 text-center lg:ml-8 rounded-md mb-4 lg:mb-0">
//             {/* Dynamic import for Wave component */}
//             <DynamicWave />
//           </div>
//         </div>

//         <div className='mb-4'>
//           {/* Dishes component */}
//           {/* Make sure Dishes component does not have window references */}
//           <Dishes />
//         </div>

//         <div>
//           <p className='text-gray-800 text-lg mb-2 font-sans font-semibold -mt-3 ml-6'>Updates</p>
//         </div>

//         <div className='flex flex-col md:flex-row lg:flex-row'>
//           {/* Low Stock Items */}
//           <div className="container bg-white shadow-md custom-sidescrollbarss lg:h-40 overflow-y-auto md:w-48 sm:w-96 lg:w-72 mb-4 text-center lg:ml-5 rounded-md sm:mx-auto">
//             <p className='text-gray-800 mb-2 font-sans font-semibold lg:mr-8'>Low Stock Items</p>
//             <div className=''>
//               {/* Check if window is defined before rendering */}
//               {typeof window !== 'undefined' && (
//                 <ul>
//                   <li className='border-t-2 mx-auto text-left pl-3 flex justify-between font-semibold'>
//                     <span>Items</span>
//                     <span className='mr-6'>Qty</span>
//                   </li>
//                   {lowStockItems.map((item, index) => (
//                     <li className='border-t text-left pl-3 flex justify-between font-medium text-gray-600' key={index}>
//                       <span>{item.itemName}</span>
//                       <span className='mr-8 text-gray-600'>{item.stockQty}</span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>

//           {/* Vendor Pending Amount */}
//           <div className="container bg-white shadow-md lg:h-40 custom-sidescrollbarss overflow-auto md:w-64 sm:w-96 lg:w-1/2 mb-4 text-center rounded-md sm:mx-auto">
//             <p className=' text-gray-800 mb-2 font-sans font-semibold'>Vendor Pending Amount</p>
//             {typeof window !== 'undefined' && (
//               <ul>
//                 <li className='border-t-2 mx-auto text-left pl-3 flex justify-between font-semibold'>
//                   <span>Vendors</span>
//                   <span className='mr-6'>Amount</span>
//                 </li>
//                 {openingBalances.map((vendor, index) => (
//                   <li className='border-t pl-3 flex justify-between font-medium text-gray-600' key={index}>
//                     <span>{vendor.vendorName}</span>
//                     <span className=' mr-2 text-gray-600'>₹ {vendor.openingBalance}</span>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* Cold Drinks component */}
//           {/* Make sure Cold Drinks component does not have window references */}
//           <div className=' mr-4'>
//             <div className="container bg-white shadow-md custom-sidescrollbarss overflow-y-auto lg:h-40 md:w-48 sm:w-96 lg:w-72 mb-4 text-center rounded-md sm:mx-auto">
//               <p className='text-gray-800 mb-2 font-sans font-semibold'>Cold-Drinks</p>
//               {typeof window !== 'undefined' && (
//                 <ul>
//                   <li className='border-t-2 mx-auto text-left pl-3 flex justify-between font-semibold'>
//                     <span>Item</span>
//                     <span className='mr-6'>Stock Qty</span>
//                   </li>
//                   {itemsWithSameNameAndMenu.map((item, index) => (
//                     <li className='border-t pl-3 flex justify-between font-medium text-gray-600' key={index}>
//                       <span>{item.itemName}</span>
//                       <span className='mr-8 text-gray-600'>{item.stockQty}</span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>
//         </div>
    
//     </>
//   );
// }

// // Export the component
// export default AdminDashboard;


'use client'

// Import necessary modules
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Square from '../components/square';
import Navbar from '../components/Navbar';
import Dishes from '../components/Dishes';
import Donut from '../components/Donut'; // Import directly
import Wave from '../components/Wave'; // Import directly

// Define the AdminDashboard component
const AdminDashboard = () => {
  // State variables
  const [lowStockItems, setLowStockItems] = useState([]);
  const [openingBalances, setOpeningBalances] = useState([]);
  const [itemsWithSameNameAndMenu, setItemsWithSameNameAndMenu] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data for low stock items
        const lowStockResponse = await axios.get('http://localhost:5000/api/item/low-stock');
        setLowStockItems(lowStockResponse.data);

        // Fetch data for opening balances
        const openingBalancesResponse = await axios.get('http://localhost:5000/api/supplier/openingBalances');
        setOpeningBalances(openingBalancesResponse.data);

        // Fetch data for items with the same name and menu
        const itemsWithSameNameAndMenuResponse = await axios.get('http://localhost:5000/api/order/itemsWithSameNameAndMenu');
        setItemsWithSameNameAndMenu(itemsWithSameNameAndMenuResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Return the JSX content
  return (
    <>
      <Navbar />
      <Square />

      <div className='flex flex-col lg:flex-row '>
        {/* Donut Chart */}
        <div className="container mx-auto bg-white shadow-md sm:w-96 md:w-full lg:w-1/3 text-center lg:ml-3.5 rounded-md mb-4 lg:mb-0">
          <Donut />
        </div>

        {/* Line Chart */}
        <div className="container mx-auto bg-white shadow-md sm:w-96 md:w-full lg:w-3/5 text-center lg:ml-8 rounded-md mb-4 lg:mb-0">
          <Wave />
        </div>
      </div>

      <div className='mb-4'>
        {/* Dishes component */}
        {/* Make sure Dishes component does not have window references */}
        <Dishes />
      </div>

      <div>
        <p className='text-gray-800 text-lg mb-2 font-sans font-semibold -mt-3 ml-6'>Updates</p>
      </div>

      <div className='flex flex-col md:flex-row lg:flex-row'>
        {/* Low Stock Items */}
        <div className="container bg-white shadow-md custom-sidescrollbarss lg:h-40 overflow-y-auto md:w-48 sm:w-96 lg:w-72 mb-4 text-center lg:ml-5 rounded-md sm:mx-auto">
          <p className='text-gray-800 mb-2 font-sans font-semibold lg:mr-8'>Low Stock Items</p>
          <div className=''>
            {/* Check if window is defined before rendering */}
            {typeof window !== 'undefined' && (
              <ul>
                <li className='border-t-2 mx-auto text-left pl-3 flex justify-between font-semibold'>
                  <span>Items</span>
                  <span className='mr-6'>Qty</span>
                </li>
                {lowStockItems.map((item, index) => (
                  <li className='border-t text-left pl-3 flex justify-between font-medium text-gray-600' key={index}>
                    <span>{item.itemName}</span>
                    <span className='mr-8 text-gray-600'>{item.stockQty}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Vendor Pending Amount */}
        <div className="container bg-white shadow-md lg:h-40 custom-sidescrollbarss overflow-auto md:w-64 sm:w-96 lg:w-1/2 mb-4 text-center rounded-md sm:mx-auto">
          <p className=' text-gray-800 mb-2 font-sans font-semibold'>Vendor Pending Amount</p>
          {typeof window !== 'undefined' && (
            <ul>
              <li className='border-t-2 mx-auto text-left pl-3 flex justify-between font-semibold'>
                <span>Vendors</span>
                <span className='mr-6'>Amount</span>
              </li>
              {openingBalances.map((vendor, index) => (
                <li className='border-t pl-3 flex justify-between font-medium text-gray-600' key={index}>
                  <span>{vendor.vendorName}</span>
                  <span className=' mr-2 text-gray-600'>₹ {vendor.openingBalance}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cold Drinks component */}
        {/* Make sure Cold Drinks component does not have window references */}
        <div className=' mr-4'>
          <div className="container bg-white shadow-md custom-sidescrollbarss overflow-y-auto lg:h-40 md:w-48 sm:w-96 lg:w-72 mb-4 text-center rounded-md sm:mx-auto">
            <p className='text-gray-800 mb-2 font-sans font-semibold'>Cold-Drinks</p>
            {typeof window !== 'undefined' && (
              <ul>
                <li className='border-t-2 mx-auto text-left pl-3 flex justify-between font-semibold'>
                  <span>Item</span>
                  <span className='mr-6'>Stock Qty</span>
                </li>
                {itemsWithSameNameAndMenu.map((item, index) => (
                  <li className='border-t pl-3 flex justify-between font-medium text-gray-600' key={index}>
                    <span>{item.itemName}</span>
                    <span className='mr-8 text-gray-600'>{item.stockQty}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Export the component
export default AdminDashboard;
