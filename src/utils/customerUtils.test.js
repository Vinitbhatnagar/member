import { buildGoogleMapsDirectionsUrl } from "./customerUtils";

describe("buildGoogleMapsDirectionsUrl", () => {
    test("uses saved coordinates when they are available", () => {
        expect(
            buildGoogleMapsDirectionsUrl({
                latitude: 21.240712,
                longitude: 72.847302,
                address: "Old address",
            })
        ).toBe("https://www.google.com/maps/dir/?api=1&destination=21.240712%2C72.847302&travelmode=driving");
    });

    test("falls back to the customer address when coordinates are missing", () => {
        expect(
            buildGoogleMapsDirectionsUrl({
                address: "71 No, Surat, Gujarat",
            })
        ).toBe("https://www.google.com/maps/dir/?api=1&destination=71+No%2C+Surat%2C+Gujarat&travelmode=driving");
    });
});
