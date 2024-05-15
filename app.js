const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const { reviewsRouter } = require("./reviews/reviews.router");
const { contactFormRouter } = require("./contact-form/contact-form.router");
const { adminRouter } = require("./admin/admin.router");
const { galleryRouter } = require("./gallery/gallery.router");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
// DODAĆ LOGIKĘ DO CORS ODNOŚNIE DOMENTY DO ZAPYTAŃ
app.use(cors());
app.use(express.json());

app.use("/reviews", reviewsRouter);
app.use("/contact-forms", contactFormRouter);
app.use("/admin", adminRouter);
app.use("/gallery", galleryRouter);

app.get("/", (req, res) => {
  console.log("Connection established");
  res.status(200).json({ message: "conected" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
  console.log("App.js not found");
});

app.use((e, req, res, next) => {
  res.status(500).json({ message: e.message });
});

module.exports = { app };
