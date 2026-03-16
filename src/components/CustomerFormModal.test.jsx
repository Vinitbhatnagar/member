import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomerFormModal from "./CustomerFormModal";

jest.mock("./LocationPickerModal", () => {
    return function MockLocationPickerModal({ isOpen, onConfirm }) {
        if (!isOpen) {
            return null;
        }

        return (
            <button
                type="button"
                onClick={() =>
                    onConfirm({
                        latitude: 21.2407123,
                        longitude: 72.8473021,
                    })
                }
            >
                Confirm Mock Pin
            </button>
        );
    };
});

describe("CustomerFormModal", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                display_name: "71 No, Surat, Gujarat",
            }),
        });

    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    test("fills the address from the selected pin location", async () => {
        render(
            <CustomerFormModal
                isOpen
                title="Edit Customer"
                submitLabel="Update Customer"
                initialValues={{
                    name: "Rahul",
                    address: "",
                    phone: "9876543210",
                    rate_per_liter: "60",
                    latitude: "",
                    longitude: "",
                }}
                onClose={jest.fn()}
                onSubmit={jest.fn().mockResolvedValue({ ok: true })}
            />
        );

        await act(async () => {
            await userEvent.click(screen.getByRole("button", { name: /pick pin location/i }));
        });

        await act(async () => {
            await userEvent.click(screen.getByRole("button", { name: /confirm mock pin/i }));
        });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByDisplayValue("71 No, Surat, Gujarat")).toBeInTheDocument();
        expect(screen.getByText(/lat: 21\.240712, lng: 72\.847302/i)).toBeInTheDocument();
        expect(screen.getByText(/pin saved and address updated from the selected location/i)).toBeInTheDocument();
    });
});
