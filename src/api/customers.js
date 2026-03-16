import axios from "axios";

const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim() || "";
const configuredToken = process.env.REACT_APP_API_TOKEN?.trim() || "";

const legacyBaseUrl = "https://generateapi.techsnack.online/api/Milkbasket";
const legacyToken = "bUq3lket09zEEdiX";
const legacyMetaStorageKey = "milkbasket_dashboard_meta_v1";

const modernApi = axios.create({
  baseURL: configuredBaseUrl,
  headers: {
    "Content-Type": "application/json",
    ...(configuredToken ? { Authorization: configuredToken } : {}),
  },
});

const legacyApi = axios.create({
  baseURL: legacyBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Authorization: configuredToken || legacyToken,
  },
});

function shouldUseModernApi() {
  return Boolean(configuredBaseUrl);
}

function extractPayload(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.Data)) {
    return data.Data;
  }

  if (data?.data && typeof data.data === "object") {
    return data.data;
  }

  if (data?.Data && typeof data.Data === "object") {
    return data.Data;
  }

  return data;
}

function getRecordId(customer) {
  return customer?.id || customer?._id || customer?.Id || customer?.ID || "";
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
}

function readLegacyMeta() {
  if (typeof window === "undefined") {
    return [];
  }

  const parsedValue = safeJsonParse(
    window.localStorage.getItem(legacyMetaStorageKey) || "[]",
  );
  return Array.isArray(parsedValue) ? parsedValue : [];
}

function writeLegacyMeta(entries) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(legacyMetaStorageKey, JSON.stringify(entries));
}

function matchesLegacyMeta(entry, customer) {
  const normalizedEntryName = String(entry?.name || "")
    .trim()
    .toLowerCase();
  const normalizedCustomerName = String(customer?.name || "")
    .trim()
    .toLowerCase();

  return (
    (entry?.id && customer?.id && entry.id === customer.id) ||
    (entry?.phone &&
      customer?.phone &&
      String(entry.phone) === String(customer.phone)) ||
    (normalizedEntryName &&
      normalizedCustomerName &&
      normalizedEntryName === normalizedCustomerName)
  );
}

function upsertLegacyMeta(customer) {
  const entries = readLegacyMeta();
  const nextEntry = {
    id: customer?.id || "",
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    rate_per_liter: Number(customer?.rate_per_liter ?? 22),
    daily_milk: Number(customer?.daily_milk ?? 1),
    total_delivered: Number(customer?.total_delivered ?? 0),
    bill_amount: Number(customer?.bill_amount ?? 0),
    collected_amount: Number(customer?.collected_amount ?? 0),
    delivery_count: Number(customer?.delivery_count ?? 0),
    distance_km: Number(customer?.distance_km ?? 0),
    latitude:
      customer?.latitude === null || customer?.latitude === undefined
        ? null
        : Number(customer.latitude),
    longitude:
      customer?.longitude === null || customer?.longitude === undefined
        ? null
        : Number(customer.longitude),
    history: Array.isArray(customer?.history) ? customer.history : [],
  };

  const index = entries.findIndex((entry) =>
    matchesLegacyMeta(entry, nextEntry),
  );

  if (index >= 0) {
    entries[index] = {
      ...entries[index],
      ...nextEntry,
    };
  } else {
    entries.unshift(nextEntry);
  }

  writeLegacyMeta(entries);
}

function removeLegacyMeta(customerOrId) {
  const entries = readLegacyMeta();
  const nextEntries = entries.filter((entry) => {
    if (typeof customerOrId === "string") {
      return entry.id !== customerOrId;
    }

    return !matchesLegacyMeta(entry, customerOrId);
  });

  writeLegacyMeta(nextEntries);
}

function mergeLegacyCustomer(remoteCustomer, index, metaEntries) {
  const id = getRecordId(remoteCustomer);
  const phone = String(remoteCustomer?.number || remoteCustomer?.phone || "");
  const meta = metaEntries.find((entry) =>
    matchesLegacyMeta(entry, {
      id,
      name: remoteCustomer?.name,
      phone,
    }),
  );

  const mergedCustomer = {
    id,
    name: remoteCustomer?.name || "",
    address: meta?.address || "Address not added",
    phone,
    rate_per_liter: Number(meta?.rate_per_liter ?? 22),
    daily_milk: Number(meta?.daily_milk ?? remoteCustomer?.liters ?? 1),
    total_delivered: Number(meta?.total_delivered ?? 0),
    bill_amount: Number(meta?.bill_amount ?? remoteCustomer?.rupees ?? 0),
    collected_amount: Number(meta?.collected_amount ?? 0),
    delivery_count: Number(meta?.delivery_count ?? 0),
    distance_km: Number(
      meta?.distance_km ?? Number((1.4 + index * 0.6).toFixed(1)),
    ),
    latitude:
      meta?.latitude ?? remoteCustomer?.latitude ?? remoteCustomer?.lat ?? null,
    longitude:
      meta?.longitude ??
      remoteCustomer?.longitude ??
      remoteCustomer?.lng ??
      remoteCustomer?.lon ??
      null,
    history: Array.isArray(meta?.history) ? meta.history : [],
  };

  upsertLegacyMeta(mergedCustomer);
  return mergedCustomer;
}

function mergeLocalGpsMeta(remoteCustomer, metaEntries) {
  const id = getRecordId(remoteCustomer);
  const phone = String(remoteCustomer?.number || remoteCustomer?.phone || "");
  const meta = metaEntries.find((entry) =>
    matchesLegacyMeta(entry, {
      id,
      name: remoteCustomer?.name,
      phone,
    }),
  );

  if (!meta) {
    return remoteCustomer;
  }

  return {
    ...remoteCustomer,
    ...(meta.latitude !== null && meta.latitude !== undefined
      ? { latitude: meta.latitude }
      : {}),
    ...(meta.longitude !== null && meta.longitude !== undefined
      ? { longitude: meta.longitude }
      : {}),
  };
}

function buildLegacyPayload(payload) {
  return {
    name: payload.name?.trim() || "",
    number: Number(payload.phone?.trim() || 0),
    liters: Number(payload.daily_milk ?? 1),
    rupees: Number(payload.bill_amount ?? 0),
  };
}

function buildModernPayload(payload) {
  return {
    name: payload?.name?.trim() || "",
    address: payload?.address?.trim() || "",
    phone: payload?.phone?.trim() || "",
    rate_per_liter: Number(payload?.rate_per_liter ?? 0),
    daily_milk: Number(payload?.daily_milk ?? 0),
    total_delivered: Number(payload?.total_delivered ?? 0),
    bill_amount: Number(payload?.bill_amount ?? 0),
    collected_amount: Number(payload?.collected_amount ?? 0),
    delivery_count: Number(payload?.delivery_count ?? 0),
    distance_km: Number(payload?.distance_km ?? 0),
    history: Array.isArray(payload?.history)
      ? payload.history.map((entry) => ({
          month: entry?.month || "",
          total_liters: Number(entry?.total_liters ?? 0),
          total_deliveries: Number(entry?.total_deliveries ?? 0),
          bill_amount: Number(entry?.bill_amount ?? 0),
        }))
      : [],
  };
}

export async function fetchCustomers() {
  if (shouldUseModernApi()) {
    const response = await modernApi.get("/customers");
    const records = extractPayload(response.data);
    const metaEntries = readLegacyMeta();

    return Array.isArray(records)
      ? records.map((customer) => mergeLocalGpsMeta(customer, metaEntries))
      : records;
  }

  const response = await legacyApi.get("");
  const records = extractPayload(response.data);
  const metaEntries = readLegacyMeta();

  return Array.isArray(records)
    ? records.map((customer, index) =>
        mergeLegacyCustomer(customer, index, metaEntries),
      )
    : [];
}

export async function createCustomer(payload) {
  if (shouldUseModernApi()) {
    const response = await modernApi.post(
      "/customers",
      buildModernPayload(payload),
    );
    const createdCustomer = extractPayload(response.data);

    upsertLegacyMeta({
      ...payload,
      id: getRecordId(createdCustomer),
    });

    return createdCustomer;
  }

  const response = await legacyApi.post("", buildLegacyPayload(payload));
  const createdCustomer = extractPayload(response.data);
  upsertLegacyMeta({
    ...payload,
    id: getRecordId(createdCustomer),
  });
  return createdCustomer;
}

export async function updateCustomer(id, payload) {
  if (shouldUseModernApi()) {
    const response = await modernApi.put(
      `/customers/${id}`,
      buildModernPayload(payload),
    );
    upsertLegacyMeta({
      ...payload,
      id,
    });
    return extractPayload(response.data);
  }

  const response = await legacyApi.put(`/${id}`, buildLegacyPayload(payload));
  upsertLegacyMeta({
    ...payload,
    id,
  });
  return extractPayload(response.data);
}

export async function removeCustomer(id) {
  if (shouldUseModernApi()) {
    await modernApi.delete(`/customers/${id}`);
    removeLegacyMeta(id);
    return;
  }

  await legacyApi.delete(`/${id}`);
  removeLegacyMeta(id);
}
