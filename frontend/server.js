const express = require("express");
const path = require("path");
const app = express();

// Serve static files from React build
app.use(express.static(path.join(__dirname, "frontend/build")));

// Handle React routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
