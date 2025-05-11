const express = require("express");
const app = express();
require("dotenv").config();
require("./conn/conn");

const cors = require("cors");
const UserAPI = require("./routes/user");
const TaskAPI = require("./routes/task");

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/v1", UserAPI);
app.use("/api/v2", TaskAPI);

// The app.listen part is for local development.
// Vercel will ignore it and use the exported app.
const PORT = process.env.PORT || 1000;
if (process.env.NODE_ENV !== 'production') { // Only listen locally if not in Vercel/production
  app.listen(PORT, () => {
    console.log(`Server started locally on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
