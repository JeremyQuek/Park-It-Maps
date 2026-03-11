import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, Grid, Box, Divider, Container } from "@mui/material";
import { IoIosArrowBack } from "react-icons/io";
import { IconButton } from "@mui/material";
import "./style.css";

function Account() {
  // States to manage the form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pressedButton, setPressedButton] = useState(null);

  // Handler to manage input changes
  const handleInputChange = (event, setState) => {
    setState(event.target.value);
  };

  // Custom button style
  const getButtonStyle = (buttonName) => ({
    backgroundColor: "black",
    color: "white",
    width: "45%",
    padding: "16px 16px",
    borderRadius: "6px",
    border: "black",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "transform 0.2s ease, opacity 0.2s ease", // Added transition for transform
    outline: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    margin: "8px",
    transform: pressedButton === buttonName ? "scale(0.95)" : "scale(1)", // Handles the scale effect
    opacity: pressedButton === buttonName ? 0.9 : 1, // Handles opacity change
  });

  // Handle button press
  const handleButtonClick = (buttonName) => {
    setPressedButton(buttonName);

    // Simulate saving logic here, e.g., after a delay, reset the scale
    setTimeout(() => {
      setPressedButton(null); // Reset the button scale after a short time
    }, 200); // Duration of the animation
  };

  return (
    <div className="page">
      <div
        className="top-bar"
        style={{
          borderBottom: "3px solid #f1f1f1",
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
        <h1>Account</h1>
      </div>
      <br />
      {/* Wrap the content in a Container with padding */}
      <Container style={{ padding: "0 5px", maxWidth: "90%" }}>
        <div className="account-form">
          {/* First Name and Last Name in the same row */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                value={firstName}
                onChange={(e) => handleInputChange(e, setFirstName)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                value={lastName}
                onChange={(e) => handleInputChange(e, setLastName)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ margin: "20px 0" }} />

          {/* Email field in a separate row */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => handleInputChange(e, setEmail)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ margin: "20px 0" }} />

          {/* Phone number field in a separate row */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={phone}
                onChange={(e) => handleInputChange(e, setPhone)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ margin: "20px 0" }} />

          {/* Custom Save Button */}
          <Box mt={3} display="flex" justifyContent="center">
            <button
              style={getButtonStyle("saveChanges")}
              onClick={() => handleButtonClick("saveChanges")}
            >
              Save Changes
            </button>
          </Box>
        </div>
      </Container>
    </div>
  );
}

export default Account;
