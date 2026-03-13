import React from "react";
import { FiClock, FiX } from "react-icons/fi";
import { formatCurrency, formatMonthlyMilk } from "../utils/customerUtils";

const HistoryModal = ({ customer, onClose }) => {
    if (!customer) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
            <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">History</p>
                        <h3 className="mt-1 text-xl font-semibold text-slate-900">{customer.name}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-slate-500 transition duration-200 active:scale-95"
                    >
                        <FiX className="text-lg" />
                    </button>
                </div>

                <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                    {customer.history.length === 0 ? (
                        <div className="rounded-2xl bg-gray-50 px-4 py-8 text-center">
                            <FiClock className="mx-auto text-2xl text-slate-300" />
                            <p className="mt-3 text-sm text-slate-500">No previous month history yet.</p>
                        </div>
                    ) : (
                        customer.history.map((entry) => (
                            <div key={entry.id} className="rounded-2xl bg-gray-50 p-4 shadow-sm ring-1 ring-gray-100">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">{entry.month}</p>
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                        {formatCurrency(entry.bill_amount)}
                                    </span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-500">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Total Liters</p>
                                        <p className="mt-1 font-semibold text-slate-800">{formatMonthlyMilk(entry.total_liters)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Deliveries</p>
                                        <p className="mt-1 font-semibold text-slate-800">{entry.total_deliveries}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
