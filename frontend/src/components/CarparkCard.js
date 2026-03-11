import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import PlaceIcon from "@mui/icons-material/Place";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import BoltIcon from "@mui/icons-material/Bolt";
import { MdOutlineBookmarkBorder, MdOutlineBookmark } from "react-icons/md";
import axios from "axios";
import { useCookies } from "react-cookie";

const CarparkCard = ({ carpark, onSelect }) => {
  const [showFullPrice, setShowFullPrice] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [cookies] = useCookies(["user"]);
  const uid = cookies.user;
  const backend_url = process.env.REACT_APP_BACKEND_URL;

  const formatPrice = (priceString) => {
    if (!priceString) return { short: "", full: "" };
    const firstSpaceIndex = priceString.indexOf(" ");
    if (firstSpaceIndex === -1)
      return { short: priceString, full: priceString };

    return {
      short: priceString.substring(0, firstSpaceIndex),
      full: priceString,
    };
  };

  const checkIfBookmarked = useCallback(async () => {
    try {
      const response = await axios.get(`${backend_url}/bookmarks`, {
        params: { uid: uid },
      });
      const isLocationBookmarked = response.data.some(
        (bookmark) =>
          bookmark[0] === carpark.address || bookmark[0] === carpark.location,
      );
      setIsBookmarked(isLocationBookmarked);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }, [backend_url, uid, carpark.address, carpark.location]); // Dependencies for the function

  // 3. Add checkIfBookmarked to the useEffect dependency array
  useEffect(() => {
    checkIfBookmarked();
  }, [checkIfBookmarked]);

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    try {
      const locationName = carpark.address || carpark.location;
      if (isBookmarked) {
        // Delete bookmark
        await axios.post(`${backend_url}/bookmarks/delete`, {
          location: locationName,
          uid: uid,
        });
        setIsBookmarked(false);
      } else {
        // Add bookmark
        await axios.post(`${backend_url}/bookmarks/add`, {
          uid: uid,
          location: locationName,
          coordinates: [parseFloat(carpark.long), parseFloat(carpark.lat)],
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const { short: shortPrice, full: fullPrice } = formatPrice(carpark.price);

  return (
    <Card
      style={{ boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
      sx={{
        borderRadius: 3,
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
          transition: "all 0.2s ease-in-out",
        },
      }}
      onClick={() => onSelect(carpark)}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle2"
            component="div"
            sx={{ fontWeight: "bold" }}
          >
            {carpark.address || carpark.location}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleBookmarkToggle}
              sx={{
                color: isBookmarked ? "#1976d2" : "inherit",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              {isBookmarked ? (
                <MdOutlineBookmark />
              ) : (
                <MdOutlineBookmarkBorder />
              )}
            </IconButton>
            <IconButton size="small" color="primary">
              <PlaceIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            color: "text.secondary",
          }}
        >
          <Box sx={{ flexBasis: "40%" }}>
            {" "}
            {/* or width: '40%' */}
            <Typography variant="body2" sx={{ ml: -8 }}>
              {Math.round(carpark.dist)}m away
            </Typography>
            {carpark.EV === "1" && (
              <Alert
                severity="success"
                icon={<BoltIcon />}
                sx={{ py: 0, minHeight: "20px", mt: 1 }}
              >
                <AlertTitle sx={{ margin: 0, fontSize: "0.78rem" }}>
                  EV Charging
                </AlertTitle>
              </Alert>
            )}
          </Box>
           
           
          {carpark.lot_type && carpark.lots_available != null && carpark.total_lots != null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {carpark.lot_type === "M" ? (
                <TwoWheelerIcon fontSize="small" />
              ) : (
                <DirectionsCarIcon fontSize="small" />
              )}
              <Typography variant="body2">
                {/* If total_lots is "0" or 0, show the error text, otherwise show the numbers */}
                {carpark.total_lots === "0" || carpark.total_lots === 0 
                  ? "No Parking Data" 
                  : `${carpark.lots_available}/${carpark.total_lots} lots`}
              </Typography>
            </Box>
          )}

          {carpark.lot_type &&
            carpark.lots_available != null &&
            !carpark.total_lots && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {carpark.lot_type === "M" ? (
                  <TwoWheelerIcon fontSize="small" />
                ) : (
                  <DirectionsCarIcon fontSize="small" />
                )}
                <Typography variant="body2">
                  {carpark.lots_available} lots
                </Typography>
              </Box>
            )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            mt: 1,
            gap: 0.5,
          }}
        >
          {carpark.price ? (
            <>
              {fullPrice === shortPrice ? (
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    textAlign: "left",
                  }}
                >
                  {fullPrice}
                </Typography>
              ) : (
                <>
                  {showFullPrice ? (
                    <>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{
                          textAlign: "left",
                        }}
                      >
                        {fullPrice}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullPrice(!showFullPrice);
                        }}
                      >
                        Hide price
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullPrice(!showFullPrice);
                      }}
                    >
                      Show price
                    </Typography>
                  )}
                </>
              )}
            </>
          ) : !carpark.lot_type && !carpark.price ? (
            <Typography variant="body2" color="text.secondary">
              No information available
            </Typography>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CarparkCard;
