'use client'

// Assuming you have a component named GSTForm.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';


const GSTForm = ({ onSubmit }) => {
    const [hotel, setHotel] = useState({});
    const [gstPercentage, setGSTPercentage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchHotelAndGSTPercentage = async () => {
            try {
                const hotelsResponse = await axios.get('http://localhost:5000/api/hotel/get-all');

                if (hotelsResponse.data.length > 0) {
                    setHotel(hotelsResponse.data[0]);
                }
            } catch (error) {
                console.error('Error fetching hotels:', error.message);
            }
        };

        fetchHotelAndGSTPercentage();
    }, []);

    const router = useRouter()
    useEffect(() => {
        const authToken = localStorage.getItem("EmployeeAuthToken");
        if (!authToken) {
          router.push("/login");
        }
      }, []);
     

    useEffect(() => {
        const fetchGSTPercentage = async () => {
            try {
                if (hotel._id) {
                    const gstResponse = await axios.get(`http://localhost:5000/api/hotel/get/${hotel._id}`);
                    setGSTPercentage(gstResponse.data.gstPercentage.toString());
                }
            } catch (error) {
                console.error('Error fetching GST Percentage:', error.message);
            }
        };

        fetchGSTPercentage();
    }, [hotel]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (hotel._id && gstPercentage !== '') {
            try {
                await axios.patch(`http://localhost:5000/api/hotel/gst/${hotel._id}`, {
                    gstPercentage: parseFloat(gstPercentage),
                });
                setSuccessMessage('GST Percentage added successfully');
                setTimeout(() => {
                    setSuccessMessage('');
                }, 2000); // Close the success message after 2 seconds
            } catch (error) {
                console.error('Error adding GST Percentage:', error.message);
            }
        }
    };

    return (
        <>
            <Navbar />

            <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-32 shadow-md font-sans">
            <div className="text-xl font-bold font-sans md:mb-0 text-orange-600 text-left ml-5">
            <span> GST Master  Order</span>
            </div>
                {/* <div className="mb-4 ml-4 mr-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hotelNameInput">
                    </label>
                    <input
                        id="hotelNameInput"
                        type="text"
                        value={hotel.hotelName || ''}
                        readOnly
                        className="block appearance-none w-full font-semibold text-center text-xl rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div> */}

                <div className="mb-4 ml-4 mt-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gstPercentageInput">
                        GST Percentage (%)
                    </label>
                    <input
                        id="gstPercentageInput"
                        type="number"
                        value={gstPercentage}
                        onChange={(e) => setGSTPercentage(e.target.value)}
                        min="0"
                        className="block appearance-none w-md border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="text-center">
                {successMessage && (
                        <div className="fixed inset-0 flex items-center justify-center">
                            <div className="bg-white border border-green-500 rounded p-7 shadow-md z-50 absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <p className="text-green-500 font-semibold text-center text-xl">
                                    GST Added Successfully
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-2 px-4 rounded-full w-72 mx-auto mb-3"
                    >
                        Save
                    </button>
                </div>
            </form>
        </>
    );
};

export default GSTForm;