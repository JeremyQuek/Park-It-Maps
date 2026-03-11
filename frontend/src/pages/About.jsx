import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { Car, Calendar, MapPin } from "lucide-react";
import {
  IconButton,
  Divider,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import * as React from "react";

function About() {
  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-blue-500" />,
      title: "Real-time Parking Information",
      description:
        "Get accurate, up-to-date information on parking availability across Singapore.",
    },
    {
      icon: <Car className="w-6 h-6 text-blue-500" />,
      title: "User-Friendly Navigation",
      description:
        "Find the perfect parking spot with just a few taps using our intuitive interface.",
    },
    {
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      title: "Regular Updates",
      description:
        "Stay informed with the latest parking data and lot availability.",
    },
  ];

  const [snackbarState, setSnackbarState] = React.useState({
    open: false,
    vertical: "bottom",
    horizontal: "center",
  });
  const { vertical, horizontal, open } = snackbarState;

  const [pressedButton, setPressedButton] = React.useState(null);

  // States for the Docs confirmation dialog
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleSnackbarClose = () => {
    setSnackbarState({ ...snackbarState, open: false });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText("https://park-it-app.vercel.app/");
      setSnackbarState({
        ...snackbarState,
        open: true,
        message: "Link copied to clipboard!",
      });
    } catch (err) {
      setSnackbarState({
        ...snackbarState,
        open: true,
        message: "Failed to copy link",
      });
    }
  };

  const createButtonHandler = (buttonName, action) => {
    return () => {
      setPressedButton(buttonName);
      action();
      setTimeout(() => setPressedButton(null), 100);
    };
  };

  const getButtonStyle = (buttonName) => ({
    backgroundColor: "black",
    color: "white",
    width: "28%",
    padding: "12px 16px",
    borderRadius: "6px",
    border: "black",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    margin: "8px",
    transform: pressedButton === buttonName ? "scale(0.95)" : "scale(1)",
    opacity: pressedButton === buttonName ? 0.9 : 1,
  });

  const textStyle = {
    color: "#3D3D3D",
    fontFamily: "'Helvetica', 'Arial', sans-serif;",
    fontSize: 15,
  };

  // Handle the Docs button click - opens the confirmation dialog
  const handleDocsClick = () => {
    setOpenDialog(true);
  };

  // Handle the dialog close and redirection if confirmed
  const handleDialogClose = (redirect) => {
    setOpenDialog(false);
    if (redirect) {
      window.open("https://github.com/JeremyQuek/ParkIt_App", "_blank");
    }
  };

  return (
    <div className="page">
      <div
        className="top-bar"
        style={{
          boxShadow: "none",
          borderBottom: "4px solid #f1f1f1",
        }}
      >
        <IconButton
          component={Link}
          to="/settings"
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
        <h1>About</h1>
      </div>

      <div style={{ textAlign: "left", marginLeft: "3%" }}>
        <div className="mt-4">
          <h4 className="text-xl font-bold text-gray-800 mb-2">
            Welcome to ParkIt!
          </h4>
          <p style={textStyle}>
            ParkIt! is a pet project designed to help drivers find parking lots
            more easily in Singapore. Our mission is to simplify the parking
            experience by providing accurate and up-to-date information on
            available parking spaces.
          </p>
        </div>

        <div className="space-y-4 mb-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-gray-50 p-3 rounded"
            >
              <div>{feature.icon}</div>
              <div>
                <h4 className="font-medium text-gray-800">{feature.title}</h4>
                <p style={textStyle}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium text-gray-800 mb-1">Technical Stack</h4>
          <p style={textStyle}>
            Built with React and Spring Boot, powered by PostgreSQL, hosted on
            Render and Vercel.
          </p>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <Divider />

      <p
        style={{
          textAlign: "left",
          fontSize: 12,
          color: "#858585",
          marginLeft: 10,
        }}
      >
        VERSION 1.12.1 @2024
      </p>
      <br />
      <br />
      <br />
      <br />
      <div style={{ flex: "column", textAlign: "left" }}>
        <button
          style={getButtonStyle("like")}
          onClick={createButtonHandler("like", () =>
            setSnackbarState({
              ...snackbarState,
              open: true,
              message: "Your like is saved. Thank you!",
            }),
          )}
        >
          Like
        </button>
        <button
          style={getButtonStyle("share")}
          onClick={createButtonHandler("share", handleShare)}
        >
          Share
        </button>
        <button
          style={getButtonStyle("docs")}
          onClick={handleDocsClick} // Trigger the dialog
        >
          Docs
        </button>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />

        <p style={{ color: "white" }}> hi </p>
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={snackbarState.message}
          key={vertical + horizontal}
        />
      </div>

      {/* Confirmation Dialog for Docs redirection */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Redirection</DialogTitle>
        <DialogContent>
          <p>
            You are about to be redirected to the GitHub documentation. Are you
            sure?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary">
            Yes, Go to Docs
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default About;
