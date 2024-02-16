import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '400px',
  height: '400px'
};

const center = {
    lat: 21.027763, // Latitude của Hà Nội
    lng: 105.834160 // Longitude của Hà Nội
  };

// Giả sử đây là mảng các vị trí của bạn
const locations = [
  { name: "Vị trí 1", location: { lat: 21.027763, lng: 105.834160 } },
  { name: "Vị trí 2", location: { lat: 21.027763, lng: 105.834160 } },
  { name: "Vị trí 3", location: { lat: 21.027763, lng: 105.834160 } },
];

function MyComponent() {
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyBWfUEs_mOAj8j1VqH2H0q4mty5vyeZBEo" // Thay thế YOUR_API_KEY bằng API key của bạn
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        { /* Child components, such as markers, info windows, etc. */ }
        {locations.map((location, index) => (
          <Marker key={index} position={location.location} />
        ))}
      </GoogleMap>
    </LoadScript>
  )
}

export default React.memo(MyComponent);
