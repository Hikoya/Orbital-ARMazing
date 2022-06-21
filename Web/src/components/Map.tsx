import React, { useCallback, memo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useToast } from '@chakra-ui/react';

const containerStyle = {
  height: '60vh',
};

function MapComponent({ location, zoomLevel, apiKey, markers }) {
  const toast = useToast();

  const showToast = useCallback(
    (data) => {
      toast.closeAll();

      toast({
        title: data.title,
        description: data.msg,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    },
    [toast],
  );

  const LocationPin = useCallback(
    ({ data, position }) => (
      <Marker
        title={data.title}
        position={position}
        onClick={() => showToast(data)}
      />
    ),
    [showToast],
  );

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location}
        zoom={zoomLevel}
      >
        {markers &&
          markers.map((mark) => (
            <LocationPin data={mark} position={mark.pos} />
          ))}
      </GoogleMap>
    </LoadScript>
  );
}

export default memo(MapComponent);
