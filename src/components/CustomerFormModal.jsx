import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FiCheckCircle, FiLoader, FiMapPin, FiNavigation, FiX } from "react-icons/fi";
import { formatGpsCoordinates, hasCoordinates, reverseGeocodeCoordinates } from "../utils/locationUtils";
import LocationPickerModal from "./LocationPickerModal";

function validate(values) {
    const errors = {};

    if (!values.name.trim()) {
        errors.name = "Customer name is required";
    }

    if (!values.address.trim()) {
        errors.address = "Address is required";
    }

    if (!values.phone.trim()) {
        errors.phone = "WhatsApp number is required";
    } else if (!/^\d{10,14}$/.test(values.phone.trim())) {
        errors.phone = "Enter a valid phone number";
    }

    if (!values.rate_per_liter) {
        errors.rate_per_liter = "Milk rate is required";
    } else if (Number(values.rate_per_liter) <= 0) {
        errors.rate_per_liter = "Milk rate must be greater than 0";
    }

    return errors;
}

const fieldClassName =
    "mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

const errorClassName = "mt-2 text-xs text-red-500";

const CustomerFormModal = ({ isOpen, title, submitLabel, initialValues, onClose, onSubmit }) => {
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [locationStatus, setLocationStatus] = useState({ type: "idle", message: "" });
    const abortControllerRef = useRef(null);

    useEffect(() => {
        setLocationStatus({ type: "idle", message: "" });
        setIsLocationPickerOpen(false);

        if (!isOpen && abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, [initialValues.latitude, initialValues.longitude, initialValues.name, initialValues.phone, isOpen]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    if (!isOpen) {
        return null;
    }

    async function handleLocationUpdate(position, setFieldValue) {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const latitude = Number(position.latitude.toFixed(6));
            const longitude = Number(position.longitude.toFixed(6));

            setFieldValue("latitude", latitude);
            setFieldValue("longitude", longitude);
            setLocationStatus({ type: "loading", message: "Saving the selected pin and fetching the address..." });

            try {
                const result = await reverseGeocodeCoordinates(latitude, longitude, {
                    signal: controller.signal,
                    language: typeof navigator !== "undefined" ? navigator.language : "en-IN",
                });

                setFieldValue("address", result.address);
                setLocationStatus({ type: "success", message: "Pin saved and address updated from the selected location." });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setFieldValue("address", formatGpsCoordinates(latitude, longitude));
                setLocationStatus({
                    type: "warning",
                    message: "Pin saved, but the full address could not be fetched. Coordinates were added instead.",
                });
            }
        } catch (error) {
            setLocationStatus({ type: "error", message: error.message || "Unable to save the selected pin." });
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
            <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Customer Form</p>
                        <h3 className="mt-1 text-xl font-semibold text-slate-900">{title}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-slate-500 transition duration-200 active:scale-95"
                    >
                        <FiX className="text-lg" />
                    </button>
                </div>

                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validate={validate}
                    onSubmit={async (values, helpers) => {
                        helpers.setStatus("");
                        const result = await onSubmit(values);

                        if (!result?.ok) {
                            helpers.setStatus(result?.error || "Something went wrong.");
                        }

                        helpers.setSubmitting(false);
                    }}
                >
                    {({ isSubmitting, setFieldValue, status, values }) => (
                        <>
                            <Form className="mt-5 space-y-4">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-slate-700">
                                        Customer Name
                                    </label>
                                    <Field id="name" name="name" type="text" className={fieldClassName} />
                                    <ErrorMessage name="name" component="p" className={errorClassName} />
                                </div>

                                <div>
                                    <label htmlFor="address" className="text-sm font-medium text-slate-700">
                                        Address
                                    </label>
                                    <Field as="textarea" id="address" name="address" rows="3" className={`${fieldClassName} resize-none`} />
                                    <ErrorMessage name="address" component="p" className={errorClassName} />
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <FiMapPin className="text-blue-500" />
                                                <span>Location (GPS)</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Open the map, tap the customer home, and save the pin location.
                                            </p>
                                        </div>
                                        {hasCoordinates(values) ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                <FiCheckCircle className="text-sm" />
                                                Saved
                                            </span>
                                        ) : null}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsLocationPickerOpen(true)}
                                        disabled={isSubmitting}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {locationStatus.type === "loading" ? (
                                            <FiLoader className="animate-spin text-base" />
                                        ) : (
                                            <FiNavigation className="text-base" />
                                        )}
                                        {locationStatus.type === "loading"
                                            ? "Saving Pin..."
                                            : hasCoordinates(values)
                                              ? "Update Pin Location"
                                              : "Pick Pin Location"}
                                    </button>

                                    {formatGpsCoordinates(values.latitude, values.longitude) ? (
                                        <p className="mt-3 text-xs italic text-slate-500">
                                            {formatGpsCoordinates(values.latitude, values.longitude)}
                                        </p>
                                    ) : null}

                                    {locationStatus.message ? (
                                        <p
                                            className={`mt-3 text-xs font-medium ${
                                                locationStatus.type === "error"
                                                    ? "text-red-500"
                                                    : locationStatus.type === "warning"
                                                      ? "text-amber-600"
                                                      : locationStatus.type === "success"
                                                        ? "text-emerald-600"
                                                        : "text-blue-600"
                                            }`}
                                        >
                                            {locationStatus.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                                        WhatsApp Number
                                    </label>
                                    <Field id="phone" name="phone" type="tel" className={fieldClassName} />
                                    <ErrorMessage name="phone" component="p" className={errorClassName} />
                                </div>

                                <div>
                                    <label htmlFor="rate_per_liter" className="text-sm font-medium text-slate-700">
                                        Milk Rate Per Liter
                                    </label>
                                    <Field id="rate_per_liter" name="rate_per_liter" type="number" min="1" className={fieldClassName} />
                                    <ErrorMessage name="rate_per_liter" component="p" className={errorClassName} />
                                </div>

                                {status ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{status}</p> : null}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition duration-200 active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition duration-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-300"
                                    >
                                        {isSubmitting ? "Saving..." : submitLabel}
                                    </button>
                                </div>
                            </Form>

                            <LocationPickerModal
                                isOpen={isLocationPickerOpen}
                                initialCoordinates={{
                                    latitude: values.latitude,
                                    longitude: values.longitude,
                                }}
                                onClose={() => setIsLocationPickerOpen(false)}
                                onConfirm={(position) => {
                                    setIsLocationPickerOpen(false);
                                    return handleLocationUpdate(position, setFieldValue);
                                }}
                            />
                        </>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CustomerFormModal;
