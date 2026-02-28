"use client";

import React, { useCallback, useMemo } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  device_count: number;
}

interface GoogleMapsViewProps {
  stores: Store[];
  onStoreClick?: (store: Store) => void;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 6.9271, // Default to Colombo, Sri Lanka
  lng: 79.8612,
};

// Helper function to validate coordinates
const isValidCoordinate = (value: any): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return typeof num === 'number' && !isNaN(num) && isFinite(num);
};

// Helper function to validate store coordinates
const hasValidCoordinates = (store: any): boolean => {
  return (
    isValidCoordinate(store.latitude) &&
    isValidCoordinate(store.longitude) &&
    store.latitude >= -90 &&
    store.latitude <= 90 &&
    store.longitude >= -180 &&
    store.longitude <= 180
  );
};

export default function GoogleMapsView({
  stores,
  onStoreClick,
}: GoogleMapsViewProps) {
  const [selectedStore, setSelectedStore] = React.useState<Store | null>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Filter stores with valid coordinates and normalize them to numbers
  const validStores = useMemo(() => {
    return stores
      .filter(hasValidCoordinates)
      .map((store) => ({
        ...store,
        latitude: typeof store.latitude === 'string' ? parseFloat(store.latitude) : store.latitude,
        longitude: typeof store.longitude === 'string' ? parseFloat(store.longitude) : store.longitude,
      }));
  }, [stores]);

  const center = useMemo(() => {
    if (validStores.length === 0) return defaultCenter;
    
    // Calculate center from all valid stores
    const avgLat =
      validStores.reduce((sum, store) => sum + store.latitude, 0) / validStores.length;
    const avgLng =
      validStores.reduce((sum, store) => sum + store.longitude, 0) / validStores.length;
    
    // Validate the calculated center
    if (!isValidCoordinate(avgLat) || !isValidCoordinate(avgLng)) {
      return defaultCenter;
    }
    
    return { lat: avgLat, lng: avgLng };
  }, [validStores]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const openDirections = (store: Store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    window.open(url, "_blank");
  };

  if (!googleMapsApiKey) {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400 p-4">
          <p className="mb-2">Google Maps API Key Required</p>
          <p className="text-sm">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={validStores.length === 1 ? 15 : validStores.length === 0 ? 10 : 12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {validStores.map((store) => (
          <Marker
            key={store.id}
            position={{ lat: store.latitude, lng: store.longitude }}
            onClick={() => {
              setSelectedStore(store);
              if (onStoreClick) {
                onStoreClick(store);
              }
            }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        ))}

        {selectedStore && (
          <InfoWindow
            position={{
              lat: selectedStore.latitude,
              lng: selectedStore.longitude,
            }}
            onCloseClick={() => setSelectedStore(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold text-gray-800 mb-1">
                {selectedStore.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {selectedStore.address}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {selectedStore.device_count || 0} devices available
              </p>
              <button
                onClick={() => openDirections(selectedStore)}
                className="text-xs text-brand-500 hover:text-brand-600"
              >
                Get Directions
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

