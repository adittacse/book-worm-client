"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function BooksPerGenreChart({ data }) {
    const chartData = Array.isArray(data) ? data : [];

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold">Books per Genre</h3>
                    <span className="badge badge-outline">{chartData.length} genres</span>
                </div>

                <div className="h-72 mt-4">
                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center opacity-70">
                            No data
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={45}
                                    outerRadius={85}
                                    paddingAngle={2}
                                >
                                    {/* Recharts requires Cell for multiple slices; default colors auto */}
                                    {chartData.map((_, idx) => (
                                        <Cell key={idx} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* simple legend */}
                {chartData.length ? (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {chartData.slice(0, 6).map((x) => (
                            <div key={x.name} className="flex items-center justify-between text-sm">
                                <span className="opacity-80 truncate">{x.name}</span>
                                <span className="font-semibold">{x.value}</span>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
