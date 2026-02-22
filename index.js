const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { initBackupScheduler } = require("./service/backupService");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Connect MongoDB
mongoose
  .connect("mongodb://localhost:27017/student_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    initBackupScheduler().catch((err) => {
      console.error("Backup scheduler failed to start:", err);
    });
  })
  .catch((err) => console.error(err));

// Routes
const routes = require("./routes");
app.use("/api", routes);

// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
