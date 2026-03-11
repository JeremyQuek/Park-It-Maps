import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import Fab from "@mui/material/Fab";

import axios from "axios";
import "./style.css";

import {
  Stack,
  Typography,
  Card,
  Snackbar,
  Alert,
  IconButton,
  Button,
} from "@mui/material";

import CarparkCard from "../components/CarparkCard";
import CarparkHeader from "../components/CarparkHeader";
import TopBar from "../components/Topbar";

import { motion, AnimatePresence } from "framer-motion";
import { DirectionsCarFilled } from "@mui/icons-material";
import NavigationIcon from "@mui/icons-material/Navigation";
import CloseIcon from "@mui/icons-material/Close";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";

const backend_url = process.env.REACT_APP_BACKEND_URL;
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function Navigation() {
  let { state } = useLocation();

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [route, setRoute] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(state?.coordinates || null);
  const [carparkData, setCarparkData] = useState(null);
  // const [showPopup, setShowPopup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [visibleResults, setVisibleResults] = useState(3);
  const [userLocation, setUserLocation] = useState(null);
  const [isUserInput, setIsUserInput] = useState(false);

  const [showGithubBox, setShowGithubBox] = useState(false);
  const [showInstructionBox, setShowInstructionBox] = useState(false);
  const [showNearMeBox, setShowNearMeBox] = useState(false);
  const [showGmapsBox, setShowGmapsBox] = useState(false);

  useEffect(() => {
    const hasSeenInThisSession = sessionStorage.getItem("hasSeenGithubBox");

    if (!hasSeenInThisSession) {
      // Show ONLY the GitHub box first
      const timer = setTimeout(() => setShowGithubBox(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeGithubBox = () => {
    sessionStorage.setItem("hasSeenGithubBox", "true");
    setShowGithubBox(false);

    // Trigger the Instruction box immediately after GitHub is closed
    setTimeout(() => {
      setShowInstructionBox(true);
    }, 1000);
  };

  const closeInstructionBox = () => {
    setShowInstructionBox(false);
    setTimeout(() => setShowNearMeBox(true), 1000);
  };

  const closeNearMeBox = () => {
    setShowNearMeBox(false);
    setTimeout(() => setShowGmapsBox(true), 1000);
  };

  const closeGmapsBox = () => {
    setShowGmapsBox(false);
    sessionStorage.setItem("hasSeenInThisSession", "true");
  };

  const findCarparks = useCallback(
    async (lat, long) => {
      try {
        const params = {
          lat: lat,
          lon: long,
        };
        console.log("Location data sent:", lat, long);
        const response = await axios.get(`${backend_url}/find`, {
          params,
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: false,
        });
        console.log("Carpark data received:", response.data);
        setCarparkData(response.data);
        setVisibleResults(3);

        // Add a marker for the destination
        if (map.current && endPoint) {
          new mapboxgl.Marker().setLngLat(endPoint).addTo(map.current);
        }

        return response.data;
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [endPoint],
  );

  const handleCarparkSelect = (carpark) => {
    console.log("Selected carpark:", carpark);

    if (carpark.lat && carpark.long) {
      const lat = parseFloat(carpark.lat);
      const lon = parseFloat(carpark.long);

      console.log("Setting endpoint to:", [lon, lat]);
      setEndPoint([lon, lat]);

      const markerId = `carpark-marker-${carpark.location}`;

      const markerElement = document.createElement("div");
      markerElement.id = markerId;
      markerElement.className = "marker";

      new mapboxgl.Marker(markerElement)
        .setLngLat([lon, lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
          <h3>${carpark.address}</h3>
          ${
            carpark.lots_available && carpark.total_lots
              ? `<p>Available lots: ${carpark.lots_available}/${carpark.total_lots}</p>`
              : ""
          }
          `),
        )
        .addTo(map.current);

      setIsExpanded(false);

      map.current.flyTo({
        center: [lon, lat],
        zoom: 15,
        essential: true,
      });
    } else {
      console.error("Invalid coordinates for carpark:", carpark);
    }
  };

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [locationErrorSnackbar, setLocationErrorSnackbar] = useState(false);
  const [destinationErrorSnackbar, setDestinationErrorSnackbar] =
    useState(false);

  const handleFindNearMe = () => {
    if (userLocation) {
      const { lat, lon } = userLocation;
      console.log("Triggering find carparks near:", lat, lon);
      findCarparks(lat, lon);
      setOpenSnackbar(true);
      setLocationErrorSnackbar(false); // Reset location error
    } else {
      console.error(
        "User location not available. Please allow location access.",
      );
      setLocationErrorSnackbar(true); // Trigger location error
    }
  };

  const handleOpenGmaps = () => {
    if (endPoint) {
      const [lon, lat] = endPoint;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
      window.open(googleMapsUrl, "_blank"); // Open Google Maps in a new tab
      setDestinationErrorSnackbar(false); // Reset destination error if valid endpoint
    } else {
      setDestinationErrorSnackbar(true); // Trigger destination error if no destination
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
    setLocationErrorSnackbar(false);
    setDestinationErrorSnackbar(false);
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: state?.coordinates || [103.8198, 1.3521],
      zoom: 11,
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Enter destination",
      className: "custom-geocoder",
    });

    map.current.addControl(geocoder);
    map.current.addControl(geolocate);
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // If coming from bookmarks with coordinates, trigger find carparks and fly to location
    if (state?.coordinates) {
      const [lon, lat] = state.coordinates;
      findCarparks(lat, lon);

      map.current.on("load", () => {
        map.current.flyTo({
          center: state.coordinates,
          zoom: 15,
          essential: true,
        });
      });
    } else {
      map.current.on("load", () => {
        geolocate.trigger();
      });
    }

    geolocate.on("geolocate", (e) => {
      const lon = e.coords.longitude;
      const lat = e.coords.latitude;
      console.log("Geolocation result:", { lat, lon });
      setStartPoint([lon, lat]);
      setUserLocation({ lat, lon });
    });

    geocoder.on("result", (e) => {
      const [longitude, latitude] = e.result.center;
      console.log("User search route result:", { longitude, latitude });

      setIsUserInput(true);
      setEndPoint([longitude, latitude]);
      findCarparks(latitude, longitude);
    });
  }, [isUserInput, state, findCarparks]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!startPoint || !endPoint) return;

      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
        );

        if (response.data?.routes?.length > 0) {
          const routeData = response.data.routes[0];

          // 1. Update the state
          setRoute(routeData);

          // 2. Ensure we use 'routeData' here to satisfy the 'unused-vars' warning
          if (map.current.getSource("route")) {
            map.current.removeLayer("route");
            map.current.removeSource("route");
          }

          map.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: routeData.geometry, // Used here!
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
          routeData.geometry.coordinates.forEach((coord) =>
            bounds.extend(coord),
          );
          map.current.fitBounds(bounds, { padding: 50 });
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
    // 3. Add 'route' here to satisfy the 'exhaustive-deps' warning
  }, [startPoint, endPoint, route]);

  const [showAll, setShowAll] = useState(false);

  const handleShowToggle = () => {
    if (showAll) {
      setVisibleResults(3);
    } else {
      setVisibleResults(carparkData.data.length);
    }
    setShowAll(!showAll);
  };

  return (
    <div className="page">
      <AnimatePresence>
        {showGithubBox && (
          <motion.div
            // Starts above the screen (-100px) and slides down to its position
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: -100, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{
              position: "fixed",
              top: "20px", // Distance from the top of the viewport
              left: "50%", // Move to the horizontal center
              transform: "translateX(-50%)", // Perfect centering trick
              zIndex: 3000, // Ensure it is above the TopBar if necessary
              width: "320px",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0px 10px 40px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {/* THE CLOSE BUTTON */}
            <IconButton
              size="small"
              onClick={closeGithubBox}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "grey.400",
                "&:hover": {
                  color: "error.main",
                  backgroundColor: "rgba(255,0,0,0.05)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {/* CONTENT */}
            <Stack spacing={1} alignItems="center" sx={{ textAlign: "center" }}>
              <GitHubIcon sx={{ fontSize: 32, color: "#24292e" }} />
              <Typography variant="subtitle2" fontWeight="700">
                Check out the Source Code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Star this project on GitHub if you find it useful!
              </Typography>
              <Button
                variant="contained"
                size="small"
                href="https://github.com/JeremyQuek/Park-It-Maps"
                target="_blank"
                sx={{
                  mt: 1,
                  bgcolor: "#24292e",
                  px: 3,
                  textTransform: "none",
                  borderRadius: "20px",
                  "&:hover": { bgcolor: "#000" },
                }}
              >
                View on GitHub
              </Button>
            </Stack>
          </motion.div>
        )}

        {showInstructionBox && (
          <motion.div
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: -100, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 3000,
              width: "280px", // Slightly narrower
              backgroundColor: "#1565c0", // MUI Primary Blue
              padding: "10px 16px", // Slimmer padding
              borderRadius: "12px",
              boxShadow: "0px 8px 30px rgba(0,0,0,0.2)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ArrowDropDownCircleIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" fontWeight="600">
                Type in a location to begin!
              </Typography>
            </Stack>

            <IconButton
              size="small"
              onClick={closeInstructionBox}
              sx={{ color: "white", ml: 1, padding: 0 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </motion.div>
        )}

        {showNearMeBox && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            style={{
              position: "fixed",
              bottom: "585px",
              left: "40%",
              zIndex: 3000,
              width: "200px",
              backgroundColor: "#292929",
              padding: "8px 12px",
              borderRadius: "8px",
              color: "white",
              boxShadow: "0px 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <Typography variant="caption" fontWeight="600" display="block">
              Click here to find carparks at your current location!
            </Typography>
            <Button
              size="small"
              onClick={closeNearMeBox}
              sx={{ color: "#90caf9", p: 0, mt: 0.5, fontSize: "0.7rem" }}
            >
              Next
            </Button>
          </motion.div>
        )}

        {showGmapsBox && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            style={{
              position: "fixed",
              bottom: "515px",
              left: "40%",
              zIndex: 3000,
              width: "200px",
              backgroundColor: "#1565c0",
              padding: "8px 12px",
              borderRadius: "8px",
              color: "white",
              boxShadow: "0px 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <Typography variant="caption" fontWeight="600" display="block">
              Open your selected destination in Google Maps.
            </Typography>
            <Button
              size="small"
              onClick={closeGmapsBox}
              sx={{ color: "white", p: 0, mt: 0.5, fontSize: "0.7rem" }}
            >
              Got it!
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 120,
          damping: 20,
        }}
      >
        <TopBar />
      </motion.div>

      <motion.div
        className="mapContainer"
        ref={mapContainer}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          ease: "easeOut",
        }}
        style={{ position: "relative" }}
      >
        <Fab
          onClick={handleFindNearMe}
          sx={{
            position: "absolute", // Fixed the typo
            bottom: "580px", // Adjust distance from the bottom of the map container
            left: "20px", // Adjust distance from the right of the map container
            color: "white",
            background: "#292929",
          }}
        >
          <DirectionsCarFilled />
        </Fab>

        <Fab
          color="primary"
          onClick={handleOpenGmaps}
          sx={{
            position: "absolute", // Fixed the typo
            bottom: "510px", // Adjust distance from the bottom of the map container
            left: "20px",
          }}
        >
          <NavigationIcon />
        </Fab>
      </motion.div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          sx={{ width: "100%" }}
        >
          Finding carparks near you
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={locationErrorSnackbar} // Location error
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          Unable to find your location.
        </Alert>
      </Snackbar>

      <Snackbar
        open={destinationErrorSnackbar} // Destination error
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          Please enter a destination.
        </Alert>
      </Snackbar>

      {carparkData && carparkData.data && (
        <div className={`carpark-popup ${!isExpanded ? "collapsed" : ""}`}>
          <CarparkHeader
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
          <div className="carpark-content">
            <div className="carpark-stack">
              <Stack
                spacing={1.5}
                sx={{
                  px: 1,
                  py: 1,
                  display: isExpanded ? "flex" : "none",
                }}
              >
                {carparkData.data
                  .slice(0, visibleResults)
                  .map((carpark, index) => (
                    <CarparkCard
                      key={index}
                      carpark={carpark}
                      onSelect={handleCarparkSelect}
                    />
                  ))}
              </Stack>
            </div>
          </div>

          {carparkData.data.length > 3 && isExpanded && (
            <div className="show-more-container">
              <Card
                sx={{
                  cursor: "pointer",
                  backgroundColor: "#1565c0",
                  textAlign: "center",
                  py: 1.8,
                  mx: "-1%",
                  mb: 1,
                  width: "91%",
                  borderRadius: 3,
                }}
                onClick={handleShowToggle}
              >
                <Typography
                  variant="button"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {showAll
                    ? "Show Less"
                    : `Show More Results (${carparkData.data.length - visibleResults} remaining)`}
                </Typography>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Navigation;
