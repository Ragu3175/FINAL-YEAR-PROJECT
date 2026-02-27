import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

// Fix for default marker icons in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom markers for different risk levels
const createCustomIcon = (color) => {
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color};" class="marker-pin"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const icons = {
    low: createCustomIcon('#22c55e'),
    medium: createCustomIcon('#eab308'),
    high: createCustomIcon('#ef4444')
};

const InteractiveMap = ({ vehicles, onVehicleSelect }) => {
    const center = [12.9716, 77.5946]; // Default center

    return (
        <div className="map-wrapper">
            <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="leaflet-container">
                {/* Using Satellite view or Hybrid as requested */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {vehicles.map((v) => {
                    const position = v.location || [v.lat, v.lng];
                    const riskLevel = (v.risk || v.status || 'low').toLowerCase();

                    return (
                        <Marker
                            key={v.id}
                            position={position}
                            icon={icons[riskLevel] || icons.low}
                            eventHandlers={{
                                click: () => onVehicleSelect(v),
                            }}
                        >
                            <Popup>
                                <div className="map-popup">
                                    <strong>{v.id}</strong><br />
                                    Speed: {v.speed}<br />
                                    Risk: {v.risk || v.status || 'Low'}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default InteractiveMap;
