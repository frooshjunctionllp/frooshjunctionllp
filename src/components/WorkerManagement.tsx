"use client";

import React, { useState } from "react";
import { WorkerUser, UserRole } from "@/types";
import {
  UserPlus,
  Shield,
  UserCheck,
  Trash2,
  Edit2,
  Lock,
  Phone,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  XCircle,
  Briefcase,
  KeyRound,
} from "lucide-react";

interface WorkerManagementProps {
  workers: WorkerUser[];
  onSaveWorker: (worker: WorkerUser) => void;
  onDeleteWorker: (id: string) => void;
  nextWorkerId: string;
  onSwitchUser?: (worker: WorkerUser) => void;
}

export const WorkerManagement: React.FC<WorkerManagementProps> = ({
  workers,
  onSaveWorker,
  onDeleteWorker,
  nextWorkerId,
  onSwitchUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  // Form state
  const [formName, setFormName] = useState("");
  const [formId, setFormId] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPin, setFormPin] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("worker");
  const [formPhone, setFormPhone] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const openCreateModal = () => {
    setEditingWorker(null);
    setFormId(nextWorkerId);
    setFormUsername(nextWorkerId.toLowerCase().replace(/[^a-z0-9]/g, ""));
    setFormName("");
    setFormPin("1234");
    setFormRole("worker");
    setFormPhone("");
    setFormIsActive(true);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (worker: WorkerUser) => {
    setEditingWorker(worker);
    setFormId(worker.id);
    setFormUsername(worker.username);
    setFormName(worker.name);
    setFormPin(worker.pin);
    setFormRole(worker.role);
    setFormPhone(worker.phone || "");
    setFormIsActive(worker.isActive);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage("Please enter worker name");
      return;
    }
    if (!formUsername.trim()) {
      setErrorMessage("Please enter a login ID/username");
      return;
    }
    if (!formPin.trim()) {
      setErrorMessage("Please enter a PIN or password");
      return;
    }

    const workerToSave: WorkerUser = {
      id: formId.trim() || nextWorkerId,
      username: formUsername.trim().toLowerCase(),
      name: formName.trim(),
      pin: formPin.trim(),
      role: formRole,
      phone: formPhone.trim() || undefined,
      isActive: formIsActive,
      createdAt: editingWorker?.createdAt || new Date().toISOString(),
    };

    onSaveWorker(workerToSave);
    setIsModalOpen(false);
  };

  const toggleShowPin = (id: string) => {
    setShowPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Staff & Worker Management
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create and manage staff logins. Workers can operate POS & create customers, but cannot view sales logs or business reports.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Worker</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID or username..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            {filteredWorkers.length} {filteredWorkers.length === 1 ? "staff" : "staff members"}
          </span>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredWorkers.map((worker) => {
          const isPinVisible = showPins[worker.id];
          const isPrimaryAdmin = worker.id === "ADM-001" || worker.username === "admin";

          return (
            <div
              key={worker.id}
              className={`bg-white border-2 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-xs ${
                worker.role === "admin"
                  ? "border-amber-300 bg-amber-50/20"
                  : worker.isActive
                  ? "border-slate-200 hover:border-red-300"
                  : "border-slate-200 bg-slate-50/70 opacity-75"
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {worker.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        worker.role === "admin"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {worker.role === "admin" ? "Store Admin" : "POS Worker"}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      worker.isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {worker.isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Disabled</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Worker Name & Role */}
                <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                  {worker.name}
                </h3>

                {/* Credentials Details Box */}
                <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Login ID:
                    </span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {worker.username}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Password / PIN:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {isPinVisible ? worker.pin : "••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleShowPin(worker.id)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                        title={isPinVisible ? "Hide PIN" : "Show PIN"}
                      >
                        {isPinVisible ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {worker.phone && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:
                      </span>
                      <span className="font-medium text-slate-700">
                        {worker.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {onSwitchUser && (
                  <button
                    onClick={() => onSwitchUser(worker)}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 active:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Login As
                  </button>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => openEditModal(worker)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Worker"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!isPrimaryAdmin && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Delete worker account "${worker.name}" (${worker.username})?`
                          )
                        ) {
                          onDeleteWorker(worker.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Worker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Worker Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                  {editingWorker ? (
                    <Edit2 className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </span>
                <h3 className="font-bold text-lg text-slate-900">
                  {editingWorker ? "Edit Staff Member" : "Create New Worker"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-2.5">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Worker ID
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                    placeholder="WRK-001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  >
                    <option value="worker">Worker (POS Only)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Login ID / Username *
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    required
                    placeholder="e.g. ramesh1"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password / PIN *
                  </label>
                  <input
                    type="text"
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    required
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveWorker"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <label
                  htmlFor="isActiveWorker"
                  className="text-xs font-semibold text-slate-700 select-none cursor-pointer"
                >
                  Active Account (Worker can log in and take orders)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {editingWorker ? "Save Changes" : "Create Worker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
