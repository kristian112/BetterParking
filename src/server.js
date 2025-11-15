require("dotenv").config();
const express = require("express");
const path = require("path");
const routes = require("./routes");
const cookieParser = require("cookie-parser");

const uploadRoutes = require("./routes-upload");



const app = express();

app.use(uploadRoutes);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});