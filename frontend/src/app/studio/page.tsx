"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Columns,
  Plus,
  RefreshCw,
  X,
  Database,
  Table2,
  Loader2,
} from "lucide-react";

const models = [
  { name: "Account", key: "account", count: 0 },
  { name: "Event", key: "event", count: 80 },
  { name: "PasswordResetToken", key: "passwordResetToken", count: 0 },
  { name: "Report", key: "report", count: 0 },
  { name: "Session", key: "session", count: 0 },
  { name: "SessionRecord", key: "sessionRecord", count: 17 },
  { name: "Site", key: "site", count: 5 },
  { name: "User", key: "user", count: 5 },
  { name: "VerificationToken", key: "verificationToken", count: 0 },
  { name: "Widget", key: "widget", count: 0 },
];

export default function BeautifulStudio() {
  const [activeModel, setActiveModel] = useState("Report");
  const [activeKey, setActiveKey] = useState("report");
  const [openTabs, setOpenTabs] = useState(["Report"]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);

  const loadData = async (modelKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/studio/${modelKey}`);
      const json = await res.json();

      if (json.data) {
        setData(json.data);

        if (json.data.length > 0) {
          setColumns(Object.keys(json.data[0]));
        } else {
          setColumns([]);
        }
      }
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeKey);
  }, [activeKey]);

  const handleModelClick = (model: (typeof models)[0]) => {
    setActiveModel(model.name);
    setActiveKey(model.key);

    if (!openTabs.includes(model.name)) {
      setOpenTabs([...openTabs, model.name]);
    }
  };

  return (
    <div className="h-screen bg-[#0c0e14] text-gray-200 flex overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#11141d] border-r border-white/5 flex flex-col">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search models"
              className="w-full bg-[#0c0e14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            All Models
          </p>

          <div className="space-y-0.5">
            {models.map((model) => (
              <button
                key={model.name}
                onClick={() => handleModelClick(model)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition group ${
                  activeModel === model.name
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Table2
                    size={15}
                    className={
                      activeModel === model.name
                        ? "text-indigo-400"
                        : "text-gray-600 group-hover:text-gray-400"
                    }
                  />
                  <span className="font-medium">{model.name}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    model.count > 0
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  {model.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="h-12 bg-[#11141d] border-b border-white/5 flex items-center px-2 gap-1">
          {openTabs.map((tab) => (
            <div
              key={tab}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm cursor-pointer transition ${
                activeModel === tab
                  ? "bg-[#1a1d27] text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => {
                const m = models.find((x) => x.name === tab);
                if (m) handleModelClick(m);
              }}
            >
              <span>{tab}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenTabs(openTabs.filter((t) => t !== tab));
                }}
                className="hover:bg-white/10 rounded p-0.5"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setOpenTabs([activeModel])}
            className="ml-2 text-xs text-gray-500 hover:text-gray-300 px-2"
          >
            Close all
          </button>
        </div>

        {/* Toolbar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f1118]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(activeKey)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition">
              <Filter size={15} />
              Filters
              <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded">None</span>
            </button>
            <span className="text-sm text-gray-500">
              Showing {data.length} record{data.length !== 1 ? "s" : ""}
            </span>
          </div>

          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-500/20">
            <Plus size={16} />
            Add record
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <Database className="w-9 h-9 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                There are no rows in this table
              </h3>
              <p className="text-sm text-gray-400 max-w-sm">
                The <span className="text-indigo-300">{activeModel}</span> model
                doesn’t have any records yet.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0f1118] border-b border-white/5">
                <tr>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">
                    <input type="checkbox" className="rounded border-gray-600" />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="p-4">
                      <input type="checkbox" className="rounded border-gray-600" />
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="p-4 text-gray-300 max-w-xs truncate">
                        {row[col] === null || row[col] === undefined
                          ? "—"
                          : typeof row[col] === "object"
                          ? JSON.stringify(row[col])
                          : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}