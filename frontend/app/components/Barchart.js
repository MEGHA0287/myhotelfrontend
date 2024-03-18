"use client";
import React from "react";
import Chart from "react-apexcharts";


function Barchart() {
    return (
        <React.Fragment>
            <div className=" container-fluid mb-5 containerht">
                <h3 className=" text-center mt-3 mb-3"> Bar Chart</h3>
                <Chart
                    type="bar"
                    width={800}
                    height={700}
                    series={[
                        {
                            name: "social",
                            data: [50, 60]
                        }
                    ]}

                    options={{
                        title: {
                            text: "Bar Chart",
                            style: { fontSize: 20 }
                        },
                        colors:['#f90000'],
                        theme:{mode:'light'},
                        xaxis:{
                            categories:["facebook", "instgram"]
                        }

                    }

                    }
                ></Chart>

            </div>
        </React.Fragment>
    )
}
export default Barchart;