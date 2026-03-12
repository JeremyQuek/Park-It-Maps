import { Link } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { TbHeadphones } from "react-icons/tb";
import { RiQuestionLine } from "react-icons/ri";
import { BiSearchAlt } from "react-icons/bi";
import { MdPersonOutline } from "react-icons/md";
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "./style.css";
import React, { useState } from "react";

function SettingsMain() {
  const Liststyle = {
    width: "100%",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };
  const item_style = {
    margin: "3px 0px",
  };

  // State for controlling the dialog box
  const [openDialog, setOpenDialog] = useState(false);

  // Handle opening the dialog
  const handleHelpClick = () => {
    setOpenDialog(true);
  };

  // Handle closing the dialog, with redirection if confirmed
  const handleDialogClose = (redirect) => {
    setOpenDialog(false);
    if (redirect) {
      window.open("https://github.com/JeremyQuek/Park-It-app", "_blank");
    }
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
        <h1>Settings</h1>
      </div>
      <br />
      <List sx={Liststyle} aria-label="mailbox folders">
        <ListItem sx={item_style}>
          <MdPersonOutline size={28} />
          <ListItemText
            sx={{ marginLeft: "5%" }}
            primary="Account"
            secondary="Manage and personalise your profile."
          />
          <IconButton component={Link} to="/account">
            <IoIosArrowForward size={20} />
          </IconButton>
        </ListItem>

        <Divider component="li" />

        <ListItem sx={item_style}>
          <BiSearchAlt size={25} />
          <ListItemText
            sx={{ marginLeft: "5%" }}
            primary="Search Options"
            secondary="Explore advanced search filters and options"
          />
          <IconButton component={Link} to="/filter">
            <IoIosArrowForward size={20} />
          </IconButton>
        </ListItem>

        <Divider component="li" />

        <ListItem sx={item_style}>
          <TbHeadphones size={25} />
          <ListItemText
            sx={{ marginLeft: "5%" }}
            primary="Project Source Code"
            secondary="Read our project and developer docs"
          />
          <IconButton onClick={handleHelpClick}>
            <IoIosArrowForward size={20} />
          </IconButton>
        </ListItem>

        <Divider component="li" />

        <ListItem sx={item_style}>
          <RiQuestionLine size={28} />
          <ListItemText
            sx={{ marginLeft: "5%" }}
            primary="About"
            secondary="Learn more about ParkIt!"
          />
          <IconButton component={Link} to="/about">
            <IoIosArrowForward size={20} />
          </IconButton>
        </ListItem>
      </List>

      {/* Confirmation Dialog for Help and Support redirection */}
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

export default SettingsMain;
