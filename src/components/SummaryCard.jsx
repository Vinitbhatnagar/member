import React from "react";
import { formatCurrency } from "../utils/customerUtils";

const SummaryCard = ({ totalCustomers, totalPendingAmount, totalCollection }) => {
    return (
        <div className="rounded-2xl bg-white p-4 shadow-card">
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Customers</p>
                    <p className="text-2xl font-bold text-slate-900">{totalCustomers}</p>
                    <p className="text-xs text-slate-400">Total Customers</p>
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Pending</p>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(totalPendingAmount)}</p>
                    <p className="text-xs text-slate-400">Pending Amount</p>
                </div>

                <div className="space-y-1 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Collected</p>
                    <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalCollection)}</p>
                    <p className="text-xs text-slate-400">Total Collection</p>
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;
