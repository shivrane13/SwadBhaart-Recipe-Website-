const path = require("path");
const express = require("express");

const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const flash = require("connect-flash");

const app = express();

const sessionStore = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "gaurav",
  database: "recipe",
  createDatabaseTable: true,
});

app.use(
  session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("images"));

app.use(flash());

app.use(function (req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;
  if (!user || !isAuth) {
    return next();
  }

  const userId = user.id;
  res.locals.isAuth = isAuth;
  res.locals.userId = userId;
  res.locals.email = user.email;
  next();
});

const recipeRoute = require("./server/routes/recipeRoutes");

app.use("/", recipeRoute);

app.get("*", function (req, res) {
  res.status(404).render("404.ejs");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
