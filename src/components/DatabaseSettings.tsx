"use client";

import React, { useState } from "react";
import { Category, Customer, Product, Sale } from "@/types";
import { storageService } from "@/services/storageService";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Server,
  CheckCircle,
  AlertTriangle,
  Code2,
  Copy,
} from "lucide-react";

interface DatabaseSettingsProps {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  onRefreshData: () => void;
}

export const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({
  categories,
  products,
  customers,
  sales,
  onRefreshData,
}) => {
  const [importStatus, setImportStatus] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleExportBackup = () => {
    const jsonStr = storageService.exportDatabase();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `froosh_junction_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importDatabase(content);
      if (success) {
        setImportStatus("Database restored successfully!");
        onRefreshData();
      } else {
        setImportStatus("Error: Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset the cache to default sample Froosh Junction data in INR?"
      )
    ) {
      storageService.resetToDefaults();
      onRefreshData();
      setImportStatus("Reset to initial Froosh Junction sample records complete!");
    }
  };

  const mongoCodeSample = `// src/lib/mongodb.ts
// Froosh Junction - MongoDB Adapter
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://<user>:<password>@cluster0.mongodb.net/froosh_junction";

export async function connectMongo() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
}

// Schemas & Models ready for MongoDB:
// 1. Customer: { id: "001", name: String, gender: "male"|"female", phone: String, instagramId: String }
// 2. Product: { name: String, categoryId: String, emoji: String, imageUrl: String, variants: [{ name, price }] }
// 3. Sale: { id: "REC-1001", customerId: "001", date: Date, items: [...], total: Number }`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mongoCodeSample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 font-poppins">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-red-600" />
          <h2 className="font-bold text-sm text-slate-900">
            Local Storage Cache & MongoDB Backend Readiness
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Froosh Junction currently runs with local cache for instant offline speed. When you provide your MongoDB connection URI, it seamlessly plugs in!
        </p>
      </div>

      {/* Cache Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">
            Categories
          </span>
          <span className="text-xl font-bold text-amber-600">
            {categories.length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">
            Juices & Shakes
          </span>
          <span className="text-xl font-bold text-red-600">
            {products.length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">
            Registered Clients
          </span>
          <span className="text-xl font-bold text-slate-800">
            {customers.length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">
            Recorded Sales
          </span>
          <span className="text-xl font-bold text-emerald-600">
            {sales.length}
          </span>
        </div>
      </div>

      {/* Backup & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
          Data Management Tools
        </h3>

        {importStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-red-600" />
                <span>Export Backup</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Download full snapshot JSON of all drinks, sales, and clients.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="pixel-btn-yellow py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Download JSON</span>
            </button>
          </div>

          {/* Import */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>Restore Backup</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Upload a previous JSON backup to restore all sales and data.
              </p>
            </div>
            <label className="pixel-btn-red py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer text-center">
              <span>Upload JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Reset Sample Data</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Reset database back to the default juice shop demo records in INR.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="pixel-btn-white py-2 px-3 rounded-lg text-xs cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* MONGODB BLUEPRINT */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              MongoDB Plug-In Blueprint
            </h3>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Whenever you provide your MongoDB connection string (Atlas or local), the app is completely structured with typed document schemas ready to persist to MongoDB collections!
        </p>

        <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 overflow-x-auto">
          <code>{mongoCodeSample}</code>
        </pre>
      </div>
    </div>
  );
};
