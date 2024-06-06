const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const sessionMiddleware = require("./src/middlewares/session");
const routesthisapp = require("./src/routes/routes");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(sessionMiddleware);

// Define Routes
app.use("/api/transactions", require("./src/routes/transactionRoutes"));
app.use("/", routesthisapp);

// Handle 404
app.use((req, res, next) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});

app.listen(port, () => {
  console.log(`FinancyQ listening on "http://localhost:${port}"`);
});
