const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatCurrency(value) {
    return currencyFormatter.format(Number(value) || 0);
}

export function formatDailyMilk(value) {
    const amount = Number(value) || 0;
    return Number.isInteger(amount) ? `${amount} L` : `${amount.toFixed(1)} L`;
}

export function formatMonthlyMilk(value) {
    return `${(Number(value) || 0).toFixed(2)} L`;
}

export function getCurrentMonthLabel(date = new Date()) {
    return new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
    }).format(date);
}

export function getHistoryEntry(entry, index) {
    return {
        month: entry?.month || getCurrentMonthLabel(),
        total_liters: Number(entry?.total_liters ?? entry?.totalDelivered ?? 0),
        total_deliveries: Number(entry?.total_deliveries ?? entry?.deliveryCount ?? 0),
        bill_amount: Number(entry?.bill_amount ?? entry?.billAmount ?? 0),
        id: entry?.id || `${entry?.month || "history"}-${index}`,
    };
}

export function normalizeCustomer(customer, index = 0) {
    const fallbackDistance = Number((1.4 + index * 0.6).toFixed(1));

    return {
        id: customer?.id || customer?._id || "",
        name: customer?.name || "",
        address: customer?.address || customer?.location || "Address not added",
        phone: String(customer?.phone || customer?.number || ""),
        rate_per_liter: Number(customer?.rate_per_liter ?? customer?.ratePerLiter ?? customer?.rate ?? 22),
        daily_milk: Number(customer?.daily_milk ?? customer?.dailyMilk ?? 1),
        total_delivered: Number(customer?.total_delivered ?? customer?.totalDelivered ?? 0),
        bill_amount: Number(customer?.bill_amount ?? customer?.billAmount ?? 0),
        collected_amount: Number(customer?.collected_amount ?? customer?.collectedAmount ?? 0),
        delivery_count: Number(customer?.delivery_count ?? customer?.deliveryCount ?? 0),
        distance_km: Number(customer?.distance_km ?? customer?.distance ?? fallbackDistance),
        history: Array.isArray(customer?.history) ? customer.history.map(getHistoryEntry) : [],
    };
}

export function buildCustomerPayload(customer) {
    return {
        name: customer.name.trim(),
        address: customer.address.trim(),
        phone: customer.phone.trim(),
        rate_per_liter: Number(customer.rate_per_liter),
        daily_milk: Number(customer.daily_milk),
        total_delivered: Number(customer.total_delivered),
        bill_amount: Number(customer.bill_amount),
        collected_amount: Number(customer.collected_amount || 0),
        delivery_count: Number(customer.delivery_count || 0),
        distance_km: Number(customer.distance_km || 0),
        history: Array.isArray(customer.history)
            ? customer.history.map((entry) => ({
                  month: entry.month,
                  total_liters: Number(entry.total_liters),
                  total_deliveries: Number(entry.total_deliveries),
                  bill_amount: Number(entry.bill_amount),
              }))
            : [],
    };
}

export function buildNewCustomer(values, customerCount) {
    return {
        name: values.name.trim(),
        address: values.address.trim(),
        phone: values.phone.trim(),
        rate_per_liter: Number(values.rate_per_liter),
        daily_milk: 1,
        total_delivered: 0,
        bill_amount: 0,
        collected_amount: 0,
        delivery_count: 0,
        distance_km: Number((1.3 + customerCount * 0.4).toFixed(1)),
        history: [],
    };
}

export function buildHistoryEntry(customer) {
    return {
        month: getCurrentMonthLabel(),
        total_liters: Number(customer.total_delivered || 0),
        total_deliveries: Number(customer.delivery_count || 0),
        bill_amount: Number(customer.bill_amount || 0),
    };
}

export function buildWhatsAppUrl(customer) {
    const message = encodeURIComponent(
        [
            `Hello ${customer.name}`,
            "",
            "Milk Delivery Summary:",
            "",
            `Daily Milk: ${Number(customer.daily_milk || 0)} L`,
            `Total Delivered: ${(Number(customer.total_delivered || 0)).toFixed(2)} L`,
            `Bill Amount: ${formatCurrency(customer.bill_amount)}`,
            "",
            "Thank you.",
        ].join("\n")
    );

    return `https://wa.me/${customer.phone}?text=${message}`;
}

export function getCustomerStatus(customer) {
    return Number(customer.bill_amount) > 0 ? "Unpaid" : "Paid";
}
