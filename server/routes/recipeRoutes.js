const express = require("express");
const routes = express.Router();
const multer = require("multer");

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/recipes");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storageConfig });

const recipeController = require("../controllers/recipeController");

routes.get("/", recipeController.homepage);
routes.get("/categories", recipeController.exploreCategories);
routes.get("/recipe/:id", recipeController.exploreRecipe);
routes.get("/categories/:name", recipeController.exploreCategoriesByname);
routes.post("/search", recipeController.searchResult);

routes.get("/explore-latest", recipeController.exploreLatest);
routes.get("/explore-random", recipeController.exploreRandom);

routes.get("/submit-recipe", recipeController.getFrom);

routes.post(
  "/submit-recipe",
  upload.single("image"),
  recipeController.submitRecipe
);

routes.get("/login", recipeController.getLoginForm);
routes.post("/login", recipeController.logInUser);

routes.get("/create-account", recipeController.createAccount);
routes.post("/create-account", recipeController.saveUser);
routes.post("/logout", recipeController.logoutUser);

routes.get("/recipe/:id/edit", recipeController.updateRecipe);

routes.post(
  "/recipe/:id/edit",
  upload.single("image"),
  recipeController.updateRecipeSubmit
);

routes.post("/recipe/:id/delete", recipeController.deleteRecipe);

routes.get("/about", recipeController.getAbout);

module.exports = routes;
