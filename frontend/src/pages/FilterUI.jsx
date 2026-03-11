import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IconButton,
  ButtonGroup,
  Button,
  Switch,
  Typography,
  Slider,
} from "@mui/material";
import { IoIosArrowBack } from "react-icons/io";
import "./style.css";

import { FaCar, FaBuilding, FaCarSide } from "react-icons/fa";
import { FaMotorcycle } from "react-icons/fa6";

const backend_url = process.env.REACT_APP_BACKEND_URL;
function valueLabelFormat(value) {
  return `${value} meters`;
}

function Filter() {
  const [selectedOption, setSelectedOption] = useState(() => {
    return localStorage.getItem("sortPreference") || "location";
  });
  const [evParking, setEvParking] = useState(() => {
    return localStorage.getItem("showEV") === "true";
  });
  const [vehicleType, setVehicleType] = useState(() => {
    return localStorage.getItem("vehicleType") || "car";
  });
  const [distance, setDistance] = useState(100);
  const sortDescriptions = {
    location:
      "The default search option, perfect for when you need to park quickly or prefer minimal walking distance.",
    price:
      "Finds the best parking prices near you, ideal for budget-conscious drivers. This option priorities carparks with price information",
    lots: "Shows the carparks with most vacancies, useful for peak hours or busy areas.  This option priorities carparks with vacancy information",
  };

  const updateBackendSettings = (
    sortType = selectedOption,
    vehType = vehicleType,
    show_ev = evParking,
  ) => {
    const queryParams = new URLSearchParams({
      sort_type: sortType,
      veh_type: vehType,
      show_ev: show_ev,
    }).toString();

    fetch(`${backend_url}/sort?${queryParams}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Settings updated successfully:", data);
      })
      .catch((error) => {
        console.error("Error updating settings:", error);
      });
  };

  const handleEvToggle = (event) => {
    const newValue = event.target.checked;
    setEvParking(newValue);
    localStorage.setItem("showEV", newValue.toString());
    console.log("THIS IS ThE NEW:", newValue);
    updateBackendSettings(selectedOption, vehicleType, newValue);
  };

  const handleVehicleSelect = (type) => {
    setVehicleType(type);
    localStorage.setItem("vehicleType", type);
    updateBackendSettings(selectedOption, type, evParking);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    localStorage.setItem("sortPreference", option);
    updateBackendSettings(option, vehicleType, evParking);
  };

  useEffect(() => {
    if (!localStorage.getItem("sortPreference")) {
      fetch(`${backend_url}/sort`)
        .then((response) => response.json())
        .then((data) => {
          if (data.sort_type) {
            const sortType = data.sort_type.toLowerCase();
            setSelectedOption(sortType);
            localStorage.setItem("sortPreference", sortType);
          }
          if (data.veh_type) {
            setVehicleType(data.veh_type);
            localStorage.setItem("vehicleType", data.veh_type);
          }
          if (data.show_ev !== undefined) {
            const showEv = data.show_ev === true;
            setEvParking(showEv);
            localStorage.setItem("showEV", showEv.toString());
          }
        })
        .catch((error) => {
          console.error("Error fetching settings:", error);
        });
    }
  }, []);

  const handleChange = (event, newValue) => {
    setDistance(newValue);
  };

  const calculateIconPosition = (value, min, max) => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className="page" style={{ background: "#fAfAfA" }}>
      <div
        className="top-bar"
        style={{
          boxShadow: "none",
          borderBottom: "4px solid #f1f1f1",
        }}
      >
        <IconButton
          component={Link}
          to="/navigation"
          edge="start"
          color="inherit"
          aria-label="back"
          style={{
            position: "absolute",
            left: 20,
          }}
        >
          <IoIosArrowBack size={28} />
        </IconButton>
        <h1>Settings</h1>
      </div>
      <div className="setting-box">
        <h3>Select your vehicle type</h3>
        <div className="settings-icon-box" style={{ marginTop: "35px" }}>
          <div
            className={`settings-icon-circle ${vehicleType === "car" ? "selected-vehicle" : ""}`}
            onClick={() => handleVehicleSelect("car")}
            style={{ marginLeft: "20%" }}
          >
            <FaCar size={35} color="white" />
          </div>

          <div
            className={`settings-icon-circle ${vehicleType === "motorcycle" ? "selected-vehicle" : ""}`}
            onClick={() => handleVehicleSelect("motorcycle")}
            style={{ marginLeft: "25%" }}
          >
            <FaMotorcycle size={35} color="white" />
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: "35px",
            fontSize: "1.0rem",
            color: "#666",
          }}
        >
          Selected: {vehicleType === "car" ? "Car" : "Motorcycle"}
        </div>
      </div>
      <div className="setting-box">
        <h3> Customise your search priority</h3>

        <div className="button-group">
          <ButtonGroup variant="outlined" aria-label="Basic button group">
            <Button
              className={`button-base sort-button ${selectedOption === "location" ? "selected" : ""}`}
              onClick={() => handleOptionClick("location")}
            >
              Location
            </Button>
            <Button
              className={`button-base sort-button ${selectedOption === "price" ? "selected" : ""}`}
              onClick={() => handleOptionClick("price")}
            >
              Price
            </Button>
            <Button
              className={`button-base sort-button ${selectedOption === "lots" ? "selected" : ""}`}
              onClick={() => handleOptionClick("lots")}
            >
              Lots
            </Button>
          </ButtonGroup>
        </div>

        {selectedOption && (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              maxWidth: "90%",
              margin: "20px auto",
              lineHeight: "1.5",
              fontSize: "0.9rem",
            }}
          >
            {sortDescriptions[selectedOption]}
          </div>
        )}
      </div>
      <div className="setting-box">
        <h3>Electric Vehicle Preferences</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            marginTop: "25px",
          }}
        >
          <Switch
            checked={evParking}
            onChange={handleEvToggle}
            sx={{ transform: "scale(2.0)" }}
          />
          <span
            style={{
              fontSize: "0.9rem",
              color: "#666",
              marginTop: "25px",
            }}
          >
            {evParking
              ? "Highlight EV Charging Stations"
              : "Regular Parking Spaces Only"}
          </span>
        </div>
      </div>
      c
      <div className="setting-box">
        <Typography id="linear-slider" gutterBottom>
          Maximum parking distance: {distance} meters
        </Typography>
        <br />
        <br />
        <div style={{ position: "relative", padding: "20px 0" }}>
          {/* Car Icon */}
          <div
            style={{
              position: "absolute",
              left: "0%",
              transform: "translateX(-50%)",
              top: "-10px",
              zIndex: 1,
            }}
          >
            <FaBuilding size={30} color={"#a1a1a1"} />
          </div>
          {/* Building Icon */}
          <div
            style={{
              position: "absolute",
              left: `${calculateIconPosition(distance, 100, 2000)}%`,
              transform: "translateX(-50%)",
              top: "-10px",
              zIndex: 1,
            }}
          >
            <FaCarSide size={30} color={"#a1a1a1"} />
          </div>
          <br /> <br />
          <Slider
            value={distance}
            min={100}
            step={1}
            max={2000}
            onChange={handleChange}
            valueLabelFormat={valueLabelFormat}
            valueLabelDisplay="auto"
            aria-labelledby="linear-slider"
          />
        </div>
      </div>
    </div>
  );
}

export default Filter;
