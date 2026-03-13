import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FiX } from "react-icons/fi";

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
    if (!isOpen) {
        return null;
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
                    {({ isSubmitting, status }) => (
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
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CustomerFormModal;
