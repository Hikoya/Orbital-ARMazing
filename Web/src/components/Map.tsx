import React, { useCallback, memo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Box, useToast } from '@chakra-ui/react';
import { checkerString } from '@helper/common';

const containerStyle = {
  height: '60vh',
};

function MapComponent({ location, zoomLevel, apiKey, markers, dataHandler }) {
  const toast = useToast();

  const showToast = useCallback(
    (data: { title: string; msg: string }) => {
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
    <Box>
      {checkerString(apiKey) && (
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={location}
            zoom={zoomLevel}
            onClick={(ev) => {
              if (dataHandler) {
                dataHandler({ lat: ev.latLng.lat(), lng: ev.latLng.lng() });
              }
            }}
          >
            {markers &&
              markers.map((mark) => (
                <LocationPin key={mark.id} data={mark} position={mark.pos} />
              ))}
          </GoogleMap>
        </LoadScript>
      )}
    </Box>
  );
}

export default memo(MapComponent);
