// const session = require("express-session");
var session = require("cookie-session");
require("dotenv").config();

// express session
// const sessionMiddleware = session({
//   secret: process.env.SECRET_SESSION_TOKEN,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }, // Set to true in production with HTTPS
// });

// cookie session
const sessionMiddleware = session({
  name: "session",
  keys: [process.env.SESSION_SECRET], // Key to encrypt cookies
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: true,
  httpOnly: true,
});

module.exports = sessionMiddleware;
