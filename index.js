const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const sessionMiddleware = require("./src/middlewares/session");
const routesthisapp = require("./src/routes/routes");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";

//menabahkan urlencoded
app.use(express.urlencoded({ extended: false }));

// Middleware
app.use(cors());
app.use(express.json());
app.set("trust proxy", 1); // trust first proxy
app.use(sessionMiddleware);

// Define Routes
app.use("/api/transactions", require("./src/routes/transactionRoutes"));
app.use("/", routesthisapp);

// App Landing Page Route
app
  .use(express.static(path.join(__dirname, "page/public")))
  .set("views", path.join(__dirname, "page/views"))
  .set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("main");
});

// Handle 404
app.use((req, res, next) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});

app.listen(port, host, () => {
  console.log(`FinancyQ listening on "http://${host}:${port}"`);
});
