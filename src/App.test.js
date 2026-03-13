import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./api/customers", () => ({
  fetchCustomers: jest.fn().mockResolvedValue([]),
  createCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  removeCustomer: jest.fn(),
}));

test("renders the milk delivery dashboard", async () => {
  render(<App />);

  expect(screen.getByText(/delivery dashboard/i)).toBeInTheDocument();
  expect(await screen.findByPlaceholderText(/search customers/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /add customer/i })).toBeInTheDocument();
});
