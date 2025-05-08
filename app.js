const express = require("express");
const app = express();
require("dotenv").config();
require("./conn/conn");

const path = require("path");

const cors = require("cors");
const UserAPI = require("./routes/user");
const TaskAPI = require("./routes/task");
app.use(cors());
app.use(express.json());
app.use("/api/v1", UserAPI);
app.use("/api/v2", TaskAPI);

app.get("/", (req, res) => {
  app.use(express.static(path.resolve(__dirname, "frontend", "build")));
  res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log("Server started");
});
