import React, { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { FiCheck, FiCrosshair, FiX } from "react-icons/fi";
import { normalizeCoordinate } from "../utils/locationUtils";

const DEFAULT_CENTER = {
    latitude: 20.5937,
    longitude: 78.9629,
};

const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 17;

function buildPosition(latitude, longitude) {
    const normalizedLatitude = normalizeCoordinate(latitude);
    const normalizedLongitude = normalizeCoordinate(longitude);

    if (normalizedLatitude === null || normalizedLongitude === null) {
        return null;
    }

    return {
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
    };
}

function MapClickHandler({ onSelect }) {
    useMapEvents({
        click(event) {
            onSelect({
                latitude: event.latlng.lat,
                longitude: event.latlng.lng,
            });
        },
    });

    return null;
}

function MapViewController({ selectedPosition }) {
    const map = useMap();

    useEffect(() => {
        if (!selectedPosition) {
            return;
        }

        map.flyTo([selectedPosition.latitude, selectedPosition.longitude], SELECTED_ZOOM, {
            duration: 0.5,
        });
    }, [map, selectedPosition]);

    return null;
}

const LocationPickerModal = ({ initialCoordinates, isOpen, onClose, onConfirm }) => {
    const [selectedPosition, setSelectedPosition] = useState(
        buildPosition(initialCoordinates?.latitude, initialCoordinates?.longitude)
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setSelectedPosition(buildPosition(initialCoordinates?.latitude, initialCoordinates?.longitude));
    }, [initialCoordinates?.latitude, initialCoordinates?.longitude, isOpen]);

    const mapCenter = useMemo(() => {
        if (selectedPosition) {
            return [selectedPosition.latitude, selectedPosition.longitude];
        }

        return [DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude];
    }, [selectedPosition]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-4 sm:items-center">
            <div className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pick Home Pin</p>
                        <h3 className="mt-1 text-xl font-semibold text-slate-900">Select Customer Location</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-slate-500 transition duration-200 active:scale-95"
                        aria-label="Close map picker"
                    >
                        <FiX className="text-lg" />
                    </button>
                </div>

                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                        <FiCrosshair className="text-blue-500" />
                        <span>Tap on the map to drop the customer home pin.</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Zoom in and tap exactly where delivery should happen. Then save the pin.
                    </p>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
                    <MapContainer
                        center={mapCenter}
                        className="h-[360px] w-full"
                        zoom={selectedPosition ? SELECTED_ZOOM : DEFAULT_ZOOM}
                        scrollWheelZoom
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onSelect={setSelectedPosition} />
                        <MapViewController selectedPosition={selectedPosition} />
                        {selectedPosition ? (
                            <CircleMarker
                                center={[selectedPosition.latitude, selectedPosition.longitude]}
                                pathOptions={{
                                    color: "#2563eb",
                                    fillColor: "#60a5fa",
                                    fillOpacity: 0.9,
                                    weight: 3,
                                }}
                                radius={11}
                            />
                        ) : null}
                    </MapContainer>
                </div>

                <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-slate-600">
                    {selectedPosition ? (
                        <p>
                            Selected Pin: {selectedPosition.latitude.toFixed(6)}, {selectedPosition.longitude.toFixed(6)}
                        </p>
                    ) : (
                        <p>Selected Pin: Tap anywhere on the map to choose the customer home.</p>
                    )}
                </div>

                <div className="mt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition duration-200 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            selectedPosition
                                ? onConfirm({
                                      latitude: Number(selectedPosition.latitude.toFixed(6)),
                                      longitude: Number(selectedPosition.longitude.toFixed(6)),
                                  })
                                : undefined
                        }
                        disabled={!selectedPosition}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition duration-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        <FiCheck />
                        Save Pin
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;
