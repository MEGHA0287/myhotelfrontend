'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';
import { decode } from 'jsonwebtoken';

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [originalPayments, setOriginalPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');


    useEffect(() => {
        // You can use the useEffect hook to set the default date when the component mounts
        setStartDate(getTodayDate());
        setEndDate(getTodayDate());
    }, []);

    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/payment/paymentsList');
                const paymentsWithTableNames = await Promise.all(
                    response.data.map(async (payment) => {
                        const tableResponse = await axios.get(`http://localhost:5000/api/table/tables/${payment.tableId}`);
                        return {
                            ...payment,
                            tableName: tableResponse.data.tableName || 'Unknown Table',
                        };
                    })
                );
                setPayments(paymentsWithTableNames);
                setOriginalPayments(paymentsWithTableNames);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching payments:', error);
                setError('Error fetching payments');
                setLoading(false);
            }
        };
        fetchPayments();

    }, []);

    const handleSearch = () => {
        const filteredPayments = originalPayments.filter((payment) => {
            const paymentDate = new Date(payment.createdAt).toISOString().split('T')[0];
            const start = startDate || '0000-01-01';
            const end = endDate || '9999-12-31';
            return paymentDate >= start && paymentDate <= end;
        });

        setPayments(filteredPayments);
    };

    const calculateTotalAmount = () => {
        return payments.reduce((total, payment) => total + payment.totalAmount, 0);
    };
    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.push("/reportLogin");
        } else {
            const decodedToken = decode(token);
            if (!decodedToken || decodedToken.role !== "superAdmin") {
                router.push("/reportLogin");
            }
        }
    }, []);
    return (
        <>
            <Navbar />
            <div className="container mx-auto p-8 bg-white rounded-md shadow-md font-sans mt-4">
                <h1 className="text-2xl font-bold mb-4">Payment Reports</h1>

                <div className="flex items-center mb-4">
                    <label className="mr-2 text-gray-600">Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded-md p-2 text-gray-700"
                    />
                    <label className="mx-2 text-gray-600">End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded-md p-2 text-gray-700"
                    />
                    <button
                        className="bg-orange-100 text-orange-600 font-bold px-4 py-2 rounded-full ml-4 hover:bg-orange-200 focus:outline-none focus:shadow-outline-blue"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>


                {loading ? (
                    <p>Loading payments...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className=" bg-zinc-100 text-yellow-700 border font-sm">
                            <tr>
                                <th className="px-6 py-1  text-center text-xs leading-4 uppercase tracking-wider">
                                    SR No
                                </th>
                                <th className="px-6 py-1  text-center text-xs leading-4 tracking-wider">
                                    Bill Number
                                </th>
                                <th className="px-6 py-1  text-center text-xs leading-4  tracking-wider">
                                    Bill Date
                                </th>
                                <th className="px-6 py-1  text-center text-xs leading-4  tracking-wider">
                                    Table Name
                                </th>
                                <th className="px-6 py-1  text-center text-xs leading-4  tracking-wider">
                                    Cash Amount
                                </th>
                                <th className="px-6 py-1  text-center text-xs leading-4  tracking-wider">
                                    Online Pay
                                </th>
                                <th className="px-6 py-1  text-center text-xs leading-4  tracking-wider">
                                    Due Amount
                                </th>
                                <th className="px-6 py-1  text-center text-xs leading-4  tracking-wider">
                                    Total Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className='text-sm'>
                            {payments.map((payment, index) => (
                                <tr key={payment._id}>
                                    <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200 text-center">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200 text-center">
                                        {payment.orderNumber.replace(/\D/g, '')}
                                    </td>
                                    <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200 text-center">
                                        {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200 text-center">
                                        {payment.tableName}
                                    </td>
                                    <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200 text-center">
                                        {payment.cashAmount}
                                    </td>
                                    <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200 text-center">
                                        {payment.onlinePaymentAmount}
                                    </td>
                                    <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200 text-center">
                                        {/* {payment.dueAmount} */}
                                        {Math.ceil(Number(payment.dueAmount)).toFixed(2)}

                                    </td>
                                    <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200 text-center">
                                        {payment.totalAmount}
                                    </td>

                                </tr>
                            ))}

                            <tr className="bg-gray-100">
                                <td className="px-6 py-3 whitespace-no-wrap border-b border-gray-200" colSpan="5"></td>
                                <td className="px-6 py-3 whitespace-no-wrap border-b border-gray-200 font-bold text-center">
                                    Total Amount:
                                </td>
                                {/* <td className="px-3 py-1 whitespace-no-wrap border-b border-gray-200"></td> */}
                                <td className="px-6 py-3 whitespace-no-wrap border-b border-gray-200"></td>
                                <td className="px-6 py-3 whitespace-no-wrap border-b border-gray-200 font-bold text-center">
                                    {Math.round(calculateTotalAmount('totalamount'))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default PaymentList;