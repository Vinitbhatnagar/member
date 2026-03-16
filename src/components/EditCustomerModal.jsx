import React from "react";
import CustomerFormModal from "./CustomerFormModal";

const EditCustomerModal = ({ customer, onClose, onSubmit }) => {
    return (
        <CustomerFormModal
            isOpen={Boolean(customer)}
            title="Edit Customer"
            submitLabel="Update Customer"
            initialValues={{
                name: customer?.name || "",
                address: customer?.address || "",
                phone: customer?.phone || "",
                rate_per_liter: customer?.rate_per_liter ? String(customer.rate_per_liter) : "",
                latitude: customer?.latitude ?? "",
                longitude: customer?.longitude ?? "",
            }}
            onClose={onClose}
            onSubmit={onSubmit}
        />
    );
};

export default EditCustomerModal;
