"use client";
import React from "react";
import Chart from "react-apexcharts";


function Linechart() {
    return (
        <React.Fragment>
            <div className=" container-fluid rounded-md">
                {/* <h3 className=" text-center mt-3 mb-3"> Line Chart</h3> */}
                <Chart 
                    type="line"
                    width={750}
                    height={300}
                    series={[
                        {
                            name: "Sale",
                            data: [20,45,67,987,456,87,321,45,569,76,890,90]
                        },
                        {
                            name: "Expenses",
                            data: [30,145,267,97,45,156,87,321,845,969,20,90]
                        }
                    ]}

                    options={{
                        title: {
                            text: "Financial",
                            style: { fontSize: 20 }
                        },
                        xaxis:{
                            categories:['Jan','Feb','Mar','Apr','May','June','Jul','Aug','Sep','Oct','Nov','Dec']
                        }

                    }

                    }
                ></Chart>

            </div>
        </React.Fragment>
    )
}
export default Linechart;