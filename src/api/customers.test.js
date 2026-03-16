describe("legacy customer updates", () => {
    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        delete process.env.REACT_APP_API_BASE_URL;
        delete process.env.REACT_APP_API_TOKEN;
    });

    test("falls back to local metadata when the legacy update endpoint is unavailable", async () => {
        const modernApi = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        };
        const legacyApi = {
            get: jest.fn().mockResolvedValue({
                data: [
                    {
                        _id: "customer-1",
                        name: "Remote Name",
                        number: 9510635022,
                        liters: 1,
                        rupees: 0,
                    },
                ],
            }),
            post: jest.fn(),
            put: jest.fn().mockRejectedValue({
                response: {
                    status: 404,
                },
            }),
            delete: jest.fn(),
        };

        jest.doMock("axios", () => ({
            __esModule: true,
            default: {
                create: jest
                    .fn()
                    .mockReturnValueOnce(modernApi)
                    .mockReturnValueOnce(legacyApi),
            },
        }));

        const { fetchCustomers, updateCustomer } = require("./customers");

        await updateCustomer("customer-1", {
            name: "Edited Name",
            address: "71 No, Surat",
            phone: "9876543210",
            rate_per_liter: 60,
            daily_milk: 2,
            total_delivered: 5,
            bill_amount: 120,
            collected_amount: 0,
            delivery_count: 3,
            distance_km: 1.7,
            latitude: 21.240712,
            longitude: 72.847302,
            history: [],
        });

        const customers = await fetchCustomers();

        expect(legacyApi.put).toHaveBeenCalledTimes(1);
        expect(customers).toHaveLength(1);
        expect(customers[0]).toMatchObject({
            id: "customer-1",
            name: "Edited Name",
            address: "71 No, Surat",
            phone: "9876543210",
            daily_milk: 2,
            bill_amount: 120,
            latitude: 21.240712,
            longitude: 72.847302,
        });
    });
});
