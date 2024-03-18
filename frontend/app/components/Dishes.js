'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const Dishes = () => {
    const [topDishes, setTopDishes] = useState([]);

    useEffect(() => {
        // Fetch data from the backend API
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/kot/items/quantity');
                setTopDishes(response.data.items);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); // Call the fetchData function when the component mounts
    }, []);

    return (
        <div>
            <div className="flex items-center text-gray-800 mb-2 font-sans lg:mt-4">
                <div className="p-4 w-full">
                    <p className='text-gray-800 mb-2 font-sans font-semibold text-lg -mt-3 lg:-mt-6'>Trending Dishes</p>
                    <div className="grid lg:grid-cols-4 w-full md:grid-cols-2 grid-cols-1 gap-3">
                        {topDishes.map((dish, index) => (
                            <div key={index}>
                                <div className="flex flex-row bg-blue-100 shadow-md rounded p-4 whitespace-nowrap">
                                    <div className="flex items-center justify-center flex-shrink-0 h-10 w-12 rounded-xl">
                                        <Image
                                            src={`/dish.png`}
                                            className="object-cover rounded-md"
                                            alt='logo' height={60} width={60}
                                        />
                                    </div>
                                    <div className="flex flex-col flex-grow ml-4">
                                        <div className="text-sm text-gray-800 font-medium">{dish._id}</div>
                                        <div className="font-bold text-sm text-gray-800">
                                            Qty: {dish.totalQuantity}<br />
                                            {/* Amount: {dish.totalAmount} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Dishes;
