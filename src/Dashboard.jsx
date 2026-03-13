import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiLoader, FiNavigation, FiPlus } from "react-icons/fi";
import AddCustomerModal from "./components/AddCustomerModal";
import CustomerCard from "./components/CustomerCard";
import EditCustomerModal from "./components/EditCustomerModal";
import FilterTabs from "./components/FilterTabs";
import HistoryModal from "./components/HistoryModal";
import SearchBar from "./components/SearchBar";
import SummaryCard from "./components/SummaryCard";
import { createCustomer, fetchCustomers, removeCustomer, updateCustomer } from "./api/customers";
import {
    buildCustomerPayload,
    buildHistoryEntry,
    buildNewCustomer,
    buildWhatsAppUrl,
    normalizeCustomer,
} from "./utils/customerUtils";

const Dashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortByDistance, setSortByDistance] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [busyCustomerId, setBusyCustomerId] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [historyCustomer, setHistoryCustomer] = useState(null);

    const loadCustomers = useCallback(async (options = {}) => {
        const preserveFeedback = options.preserveFeedback || false;
        const showLoader = options.showLoader !== false;

        if (showLoader) {
            setIsLoading(true);
        }

        if (!preserveFeedback) {
            setFeedback({ type: "", message: "" });
        }

        try {
            const records = await fetchCustomers();
            const normalizedCustomers = Array.isArray(records) ? records.map((customer, index) => normalizeCustomer(customer, index)) : [];
            setCustomers(normalizedCustomers);
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                message: "Unable to load customers. Check your API connection and token settings.",
            });
        } finally {
            if (showLoader) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const filteredCustomers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const nextCustomers = customers.filter((customer) => {
            const matchesSearch = normalizedSearch ? customer.name.toLowerCase().includes(normalizedSearch) : true;
            const matchesFilter =
                activeFilter === "All" ||
                (activeFilter === "Paid" && Number(customer.bill_amount) === 0) ||
                (activeFilter === "Unpaid" && Number(customer.bill_amount) > 0);

            return matchesSearch && matchesFilter;
        });

        if (sortByDistance) {
            return [...nextCustomers].sort((left, right) => Number(left.distance_km) - Number(right.distance_km));
        }

        return nextCustomers;
    }, [activeFilter, customers, searchTerm, sortByDistance]);

    const summary = useMemo(() => {
        return customers.reduce(
            (accumulator, customer) => {
                accumulator.totalCustomers += 1;
                accumulator.totalPendingAmount += Number(customer.bill_amount || 0);
                accumulator.totalCollection += Number(customer.collected_amount || 0);
                return accumulator;
            },
            {
                totalCustomers: 0,
                totalPendingAmount: 0,
                totalCollection: 0,
            }
        );
    }, [customers]);

    async function refreshAfterMutation(successMessage) {
        setFeedback({ type: "success", message: successMessage });
        await loadCustomers({ preserveFeedback: true, showLoader: false });
    }

    async function saveCustomerUpdate(customer, successMessage, errorMessage) {
        if (!customer.id) {
            setFeedback({ type: "error", message: "Customer id is missing. Unable to save changes." });
            return false;
        }

        setBusyCustomerId(customer.id);

        try {
            await updateCustomer(customer.id, buildCustomerPayload(customer));
            await refreshAfterMutation(successMessage);
            return true;
        } catch (error) {
            console.error(error);
            setFeedback({ type: "error", message: errorMessage });
            return false;
        } finally {
            setBusyCustomerId("");
        }
    }

    async function handleAddCustomer(values) {
        try {
            await createCustomer(buildNewCustomer(values, customers.length));
            setIsAddModalOpen(false);
            await refreshAfterMutation("Customer created successfully.");
            return { ok: true };
        } catch (error) {
            console.error(error);
            return { ok: false, error: "Unable to create customer." };
        }
    }

    async function handleEditCustomer(values) {
        if (!editingCustomer) {
            return { ok: false, error: "No customer selected." };
        }

        const updatedCustomer = {
            ...editingCustomer,
            name: values.name.trim(),
            address: values.address.trim(),
            phone: values.phone.trim(),
            rate_per_liter: Number(values.rate_per_liter),
        };

        const didSave = await saveCustomerUpdate(updatedCustomer, "Customer updated successfully.", "Unable to update customer.");

        if (didSave) {
            setEditingCustomer(null);
            return { ok: true };
        }

        return { ok: false, error: "Unable to update customer." };
    }

    async function handleDeleteCustomer(customer) {
        if (!customer.id) {
            setFeedback({ type: "error", message: "Customer id is missing. Unable to delete." });
            return;
        }

        const shouldDelete = window.confirm(`Delete ${customer.name}?`);

        if (!shouldDelete) {
            return;
        }

        setBusyCustomerId(customer.id);

        try {
            await removeCustomer(customer.id);
            await refreshAfterMutation("Customer deleted successfully.");
        } catch (error) {
            console.error(error);
            setFeedback({ type: "error", message: "Unable to delete customer." });
        } finally {
            setBusyCustomerId("");
        }
    }

    async function handleMilkChange(customer, delta) {
        const nextDailyMilk = Math.max(0, Number(customer.daily_milk || 0) + delta);
        const updatedCustomer = {
            ...customer,
            daily_milk: nextDailyMilk,
        };

        await saveCustomerUpdate(updatedCustomer, "Daily milk updated.", "Unable to update daily milk.");
    }

    async function handleDeliver(customer) {
        const deliveredLiters = Number(customer.total_delivered || 0) + Number(customer.daily_milk || 0);
        const nextBillAmount = Number(customer.bill_amount || 0) + Number(customer.daily_milk || 0) * Number(customer.rate_per_liter || 0);

        const updatedCustomer = {
            ...customer,
            total_delivered: deliveredLiters,
            bill_amount: Number(nextBillAmount.toFixed(2)),
            delivery_count: Number(customer.delivery_count || 0) + 1,
        };

        await saveCustomerUpdate(updatedCustomer, "Delivery marked successfully.", "Unable to mark delivery.");
    }

    async function handlePaid(customer) {
        if (Number(customer.bill_amount || 0) === 0 && Number(customer.total_delivered || 0) === 0) {
            setFeedback({ type: "error", message: "No pending bill to clear for this customer." });
            return;
        }

        const updatedCustomer = {
            ...customer,
            collected_amount: Number(customer.collected_amount || 0) + Number(customer.bill_amount || 0),
            total_delivered: 0,
            bill_amount: 0,
            delivery_count: 0,
            history: [buildHistoryEntry(customer), ...customer.history],
        };

        await saveCustomerUpdate(updatedCustomer, "Payment recorded successfully.", "Unable to mark payment.");
    }

    function handleWhatsApp(customer) {
        if (!customer.phone) {
            setFeedback({ type: "error", message: `Add a phone number for ${customer.name} before sending WhatsApp updates.` });
            return;
        }

        window.open(buildWhatsAppUrl(customer), "_blank", "noopener,noreferrer");
    }

    function handleCalendar(customer) {
        setFeedback({
            type: "info",
            message: `${customer.name}'s current billing cycle is active. Use Deliver to add entries and Paid to archive the month.`,
        });
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-28">
            <div className="mx-auto flex max-w-md flex-col space-y-4 p-4">
                <div className="space-y-1 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Milk Delivery</p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Delivery Dashboard</h1>
                    <p className="text-sm text-slate-500">Mobile-first milk management with live delivery actions.</p>
                </div>

                <SummaryCard
                    totalCustomers={summary.totalCustomers}
                    totalPendingAmount={summary.totalPendingAmount}
                    totalCollection={summary.totalCollection}
                />

                {feedback.message ? (
                    <div
                        className={`rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
                            feedback.type === "error"
                                ? "bg-red-50 text-red-500"
                                : feedback.type === "info"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-emerald-50 text-emerald-600"
                        }`}
                    >
                        {feedback.message}
                    </div>
                ) : null}

                <SearchBar value={searchTerm} onChange={setSearchTerm} />

                <button
                    type="button"
                    onClick={() => setSortByDistance((currentValue) => !currentValue)}
                    className={`flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition duration-200 active:scale-95 ${
                        sortByDistance ? "border-blue-500 bg-blue-50 text-blue-500" : "border-gray-200 bg-white text-blue-500"
                    }`}
                >
                    <FiNavigation />
                    By Distance
                </button>

                <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center rounded-2xl bg-white px-4 py-10 shadow-card">
                            <FiLoader className="animate-spin text-xl text-blue-500" />
                            <span className="ml-3 text-sm font-medium text-slate-500">Loading customers...</span>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="rounded-2xl bg-white px-5 py-10 text-center shadow-card">
                            <p className="text-base font-semibold text-slate-800">No customers found</p>
                            <p className="mt-2 text-sm text-slate-500">Try another search term or add a new customer.</p>
                        </div>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <CustomerCard
                                key={customer.id || `${customer.name}-${customer.phone}`}
                                customer={customer}
                                isBusy={busyCustomerId === customer.id}
                                onIncreaseMilk={() => handleMilkChange(customer, 1)}
                                onDecreaseMilk={() => handleMilkChange(customer, -1)}
                                onDeliver={() => handleDeliver(customer)}
                                onPaid={() => handlePaid(customer)}
                                onWhatsApp={() => handleWhatsApp(customer)}
                                onCalendar={() => handleCalendar(customer)}
                                onEdit={() => setEditingCustomer(customer)}
                                onHistory={() => setHistoryCustomer(customer)}
                                onDelete={() => handleDeleteCustomer(customer)}
                            />
                        ))
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition duration-200 active:scale-95"
                aria-label="Add customer"
            >
                <FiPlus className="text-2xl" />
            </button>

            <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddCustomer} />
            <EditCustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSubmit={handleEditCustomer} />
            <HistoryModal customer={historyCustomer} onClose={() => setHistoryCustomer(null)} />
        </div>
    );
};

export default Dashboard;
