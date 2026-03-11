import React from "react";
import { Card, CardContent, Typography, IconButton } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const CarparkHeader = ({ isExpanded, setIsExpanded }) => (
  <Card
    sx={{
      mb: 2,
      backgroundColor: "#1976d2",
      borderRadius: 5,
      boxShadow: 2,
      position: "relative",
      cursor: "pointer",
    }}
    onClick={() => setIsExpanded(!isExpanded)}
  >
    <CardContent
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px !important",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          color: "white",
          fontWeight: "bold",
          margin: 0,
          marginRight: 1,
        }}
      >
        Nearby Carparks
      </Typography>
      <IconButton
        size="small"
        sx={{
          color: "white",
          padding: 0,
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
        }}
      >
        {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
      </IconButton>
    </CardContent>
  </Card>
);

export default CarparkHeader;
