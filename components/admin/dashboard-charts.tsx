"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatusItem {
  name: string;
  count: number;
  color: string;
}

interface SourceItem {
  source: string;
  count: number;
}

interface DashboardChartsProps {
  statusData: StatusItem[];
  sourceData: SourceItem[];
}

export function DashboardCharts({ statusData, sourceData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Listings by Status (Donut / Pie Chart) */}
      <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Listings by Status</h3>
            <p className="text-xs text-slate-500">Current showroom inventory distribution</p>
          </div>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
            Realtime DB
          </span>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "12px",
                  color: "#0f172a",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-slate-100">
          {statusData.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-slate-600 font-medium">{s.name}:</span>
              <span className="text-slate-900 font-bold">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Leads by Source (Bar Chart) */}
      <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Leads by Source</h3>
            <p className="text-xs text-slate-500">Customer inquiry acquisition channels</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Acquisition
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="source" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "12px",
                  color: "#0f172a",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="count" fill="#e11d48" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Highest converting lead channel:</span>
          <span className="text-slate-900 font-bold">
            {sourceData.length > 0
              ? [...sourceData].sort((a, b) => b.count - a.count)[0]?.source
              : "Website"}
          </span>
        </div>
      </div>
    </div>
  );
}
