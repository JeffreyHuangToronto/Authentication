require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index"); // Not used
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const { auth } = require("express-openid-connect"); // Get the package we need for authentication
const { requiresAuth } = require("express-openid-connect"); // Include in route if it needs authentication to access

// Auth0 Config
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET, // Secret must be confidential
  baseURL: "http://localhost:8080",
  clientID: "ph6bxVuu8vNrotrGeS7DwOAtCBD33gW1",
  issuerBaseURL: "https://dev-uifc7c3l.us.auth0.com",
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.use("/", indexRouter);
app.get("/", (req, res) => {
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

// Requiring Authentication
app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.use("/users", requiresAuth(), usersRouter);

app.listen(process.env.PORT || 3503, () => {
  console.log(`It's alive on http://localhost:${process.env.PORT}`);
});

module.exports = app;
