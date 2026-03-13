import React from "react";
import {
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiEdit2,
    FiMapPin,
    FiMessageCircle,
    FiMinus,
    FiPlus,
    FiTrash2,
    FiTruck,
} from "react-icons/fi";
import { formatCurrency, formatDailyMilk, formatMonthlyMilk, getCustomerStatus } from "../utils/customerUtils";

const iconButtonClassName =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-gray-200 transition duration-200 hover:text-slate-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

const milkButtonClassName =
    "flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 transition duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

const CustomerCard = ({
    customer,
    isBusy,
    onIncreaseMilk,
    onDecreaseMilk,
    onDeliver,
    onPaid,
    onWhatsApp,
    onCalendar,
    onEdit,
    onHistory,
    onDelete,
}) => {
    const status = getCustomerStatus(customer);
    const isPaid = status === "Paid";

    return (
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow-card transition duration-200 hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-900">{customer.name}</h3>
                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                        <FiMapPin className="mt-0.5 shrink-0 text-blue-500" />
                        <div className="min-w-0">
                            <p className="leading-5">{customer.address}</p>
                            <p className="mt-1 text-xs font-medium text-slate-400">{customer.distance_km.toFixed(1)} km away</p>
                        </div>
                    </div>
                </div>

                <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        isPaid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                >
                    {status}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-gray-50 px-3 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Daily Milk</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDailyMilk(customer.daily_milk)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 px-3 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Delivered</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatMonthlyMilk(customer.total_delivered)}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 px-3 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-blue-400">Bill Amount</p>
                    <p className="mt-2 text-sm font-semibold text-blue-600">{formatCurrency(customer.bill_amount)}</p>
                </div>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                <button type="button" onClick={onDecreaseMilk} disabled={isBusy} className={milkButtonClassName}>
                    <FiMinus />
                </button>
                <span className="min-w-[64px] text-center text-lg font-semibold text-slate-900">{Number(customer.daily_milk) || 0}</span>
                <button type="button" onClick={onIncreaseMilk} disabled={isBusy} className={milkButtonClassName}>
                    <FiPlus />
                </button>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onDeliver}
                    disabled={isBusy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition duration-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-green-300"
                >
                    <FiTruck />
                    Deliver
                </button>
                <button
                    type="button"
                    onClick={onPaid}
                    disabled={isBusy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition duration-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                    <FiCheckCircle />
                    Paid
                </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2">
                <button type="button" onClick={onWhatsApp} disabled={isBusy} className={iconButtonClassName} aria-label="Send WhatsApp summary">
                    <FiMessageCircle />
                </button>
                <button type="button" onClick={onCalendar} disabled={isBusy} className={iconButtonClassName} aria-label="View billing cycle">
                    <FiCalendar />
                </button>
                <button type="button" onClick={onEdit} disabled={isBusy} className={iconButtonClassName} aria-label="Edit customer">
                    <FiEdit2 />
                </button>
                <button type="button" onClick={onHistory} disabled={isBusy} className={iconButtonClassName} aria-label="Open history">
                    <FiClock />
                </button>
                <button type="button" onClick={onDelete} disabled={isBusy} className={iconButtonClassName} aria-label="Delete customer">
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
};

export default CustomerCard;
