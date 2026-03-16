import React from "react";
import CustomerFormModal from "./CustomerFormModal";

const AddCustomerModal = ({ isOpen, onClose, onSubmit }) => {
    return (
        <CustomerFormModal
            isOpen={isOpen}
            title="Add Customer"
            submitLabel="Create Customer"
            initialValues={{
                name: "",
                address: "",
                phone: "",
                rate_per_liter: "",
                latitude: "",
                longitude: "",
            }}
            onClose={onClose}
            onSubmit={onSubmit}
        />
    );
};

export default AddCustomerModal;
