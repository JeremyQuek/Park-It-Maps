import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import axios from "axios";
const useMapbox = (onLocationSelect) => {
  const map = useRef(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState(null);

  const initializeMap = (container) => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: container,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [103.8198, 1.3521],
      zoom: 11,
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add geolocation control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.current.addControl(geolocate);

    // Handle geolocation
    map.current.on("load", () => {
      geolocate.trigger();
    });

    geolocate.on("geolocate", (e) => {
      const lon = e.coords.longitude;
      const lat = e.coords.latitude;
      setStartPoint([lon, lat]);
    });

    // Add geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Enter destination",
    });
    map.current.addControl(geocoder);

    geocoder.on("result", (e) => {
      const [longitude, latitude] = e.result.center;
      setEndPoint(e.result.center);
      if (onLocationSelect) {
        onLocationSelect(latitude, longitude);
      }
    });
  };

  const addMarker = (coordinates, properties) => {
    const { id, popupHTML } = properties;
    const markerId = `marker-${id}`;

    // Remove existing marker if any
    const existingMarker = document.getElementById(markerId);
    if (existingMarker) {
      existingMarker.remove();
    }

    const markerElement = document.createElement("div");
    markerElement.id = markerId;
    markerElement.className = "marker";

    return new mapboxgl.Marker(markerElement)
      .setLngLat(coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(popupHTML))
      .addTo(map.current);
  };

  const flyToLocation = (coordinates, zoom = 15) => {
    map.current.flyTo({
      center: coordinates,
      zoom: zoom,
      essential: true,
    });
  };

  const drawRoute = async (start, end) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
      );

      if (
        response.data &&
        response.data.routes &&
        response.data.routes.length > 0
      ) {
        const newRoute = response.data.routes[0];
        setRoute(newRoute);

        if (map.current.getSource("route")) {
          map.current.removeLayer("route");
          map.current.removeSource("route");
        }

        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: newRoute.geometry,
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#888",
            "line-width": 8,
          },
        });

        const bounds = new mapboxgl.LngLatBounds();
        newRoute.geometry.coordinates.forEach((coord) => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return {
    map,
    startPoint,
    endPoint,
    route,
    initializeMap,
    addMarker,
    flyToLocation,
    drawRoute,
  };
};

export default useMapbox;
