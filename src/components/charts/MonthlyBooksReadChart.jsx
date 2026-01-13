"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

export default function MonthlyBooksReadChart({ data, year }) {
    const chartData = Array.isArray(data) ? data : [];

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold">Monthly Books Read</h3>
                    <span className="badge badge-outline">{year}</span>
                </div>

                <div className="h-72 mt-4">
                    {
                        chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center opacity-70">
                                No data
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="books" />
                                </LineChart>
                            </ResponsiveContainer>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
