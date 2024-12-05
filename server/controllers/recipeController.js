const db = require("../database/database");

async function homepage(req, res) {
  try {
    const data = await db.query("select * from category LIMIT 5");
    const [latest] = await db.query(
      "SELECT * FROM recipe ORDER BY id DESC LIMIT 5"
    );

    const [panjabi] = await db.query(
      " SELECT * FROM recipe WHERE category='Panjabi' ORDER BY id DESC LIMIT 5 ;"
    );

    const [maharashtrian] = await db.query(
      "SELECT * FROM recipe WHERE category='Maharashtrian' ORDER by id DESC LIMIT 5 "
    );

    const [gujarati] = await db.query(
      "SELECT * FROM recipe WHERE category='Gujarati' ORDER BY id DESC LIMIT 5"
    );

    const categories = data[0];

    res.render("index.ejs", {
      title: "Indian Recipes- Home",
      categories: categories,
      latest,
      panjabi,
      maharashtrian,
      gujarati,
    });
  } catch (error) {
    console.log(error);
  }
}

async function exploreCategories(req, res) {
  try {
    const data = await db.query("select * from category");
    const categories = data[0];
    res.render("categories.ejs", {
      title: "Indian Recipes- Home",
      categories: categories,
    });
  } catch (error) {
    console.log(error);
  }
}

async function exploreRecipe(req, res) {
  try {
    const id = req.params.id;
    const [[recipe]] = await db.query(`SELECT * FROM recipe WHERE id= ?`, [id]);

    const ingredients = recipe.ingredient.split("\n");

    res.render("recipe.ejs", {
      title: `Indian Recipe-${recipe.name}`,
      recipe: recipe,
      ingredients,
    });
  } catch (error) {
    console.log(error);
  }
}

async function exploreCategoriesByname(req, res) {
  try {
    const name = req.params.name;
    const [categoryRecipe] = await db.query(
      `SELECT * FROM recipe where category = ? ORDER BY id DESC`,
      [name]
    );
    res.render("selectedCategory.ejs", {
      title: `Indian Recipe-${categoryRecipe.name}`,
      categoryRecipe: categoryRecipe,
      name: name,
    });
  } catch (error) {
    console.log(error);
  }
}

async function searchResult(req, res) {
  try {
    let searchTerm = req.body.searchTerm;
    const keyword = `%${searchTerm}%`;
    const query =
      "SELECT * FROM recipe WHERE name LIKE ? OR ingredient LIKE ? OR description LIKE ? ";
    const [Recipes] = await db.query(query, [keyword, keyword, keyword]);
    res.render("search.ejs", {
      title: " Indain Recipe-Search",
      Recipes: Recipes,
    });
  } catch (error) {
    console.log(error);
  }
}

async function exploreLatest(req, res) {
  try {
    const [recipes] = await db.query(
      "SELECT * FROM recipe ORDER BY id DESC LIMIT 20"
    );

    res.render("explore-latest.ejs", {
      title: "Indian Recipies-Explore latest",
      recipes: recipes,
    });
  } catch (error) {
    console.log(error);
  }
}

async function exploreRandom(req, res) {
  try {
    const [[count]] = await db.query("SELECT count(id) as count  FROM recipe");
    const random = Math.floor(Math.random() * count.count);
    const [data] = await db.query("SELECT * FROM recipe");
    const randomRecipe = data[random];
    res.render("explore-random.ejs", {
      title: "Indian Recipe- Suggestion",
      randomRecipe: randomRecipe,
    });
  } catch (error) {
    console.log(error);
  }
}

async function getFrom(req, res) {
  try {
    const [categories] = await db.query("Select name from category");
    const infoErrorsObj = req.flash("infoErrors");
    const infoSubmitObj = req.flash("infoSubmit");
    const loginError = req.flash("loginError");
    let userRecipe;

    if (req.session.user != null) {
      [userRecipe] = await db.query(
        "SELECT recipe.* FROM recipe, user WHERE recipe.userid = user.id AND user.id= ?",
        req.session.user.id
      );
    }

    res.render("submit.ejs", {
      title: "Indian Recipe- Submit",
      categories: categories,
      infoErrorsObj: infoErrorsObj,
      infoSubmitObj: infoSubmitObj,
      loginError: loginError,
      userRecipe: userRecipe,
    });
  } catch (error) {
    console.log(error);
  }
}

async function submitRecipe(req, res) {
  try {
    const uploadedImage = req.file.path;
    const imagePath = uploadedImage.substring(6);
    const data = [
      req.body.name,
      req.body.description,
      req.body.ingredients,
      req.body.category,
      imagePath,
      req.session.user.id,
    ];
    await db.query(
      "INSERT INTO recipe (name, description, ingredient, category, image, userid) value (?)",
      [data]
    );
    req.flash("infoSubmit", "Recipe has been added.");
    res.redirect("/submit-recipe");
  } catch (error) {
    req.flash("infoErrors", error);
    res.render("/submit-recipe");
  }
}

function getLoginForm(req, res) {
  const loginError = req.flash("loginError");
  const title = "Indian Recipe- Login";
  res.render("login1.ejs", { title: title, loginError: loginError });
}

async function logInUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const [existingUser] = await db.query(
    "SELECT * FROM user WHERE email = ?",
    email
  );
  if (existingUser.length == 0 || existingUser[0].password != password) {
    req.flash("loginError", "Invalid Username of Password");
    res.redirect("/login");
  } else {
    req.session.user = {
      id: existingUser[0].id,
      email: existingUser[0].email,
    };
    req.session.isAuthenticated = true;
    req.session.save(function () {
      return res.redirect("/submit-recipe");
    });
  }
}

async function createAccount(req, res) {
  const submitSuccess = req.flash("create-account-succes");
  const errorCreate = req.flash("errorCreate");
  const userExist = req.flash("user-exist");
  res.render("create-account.ejs", {
    title: "Indian-Recipe- Create account",
    submitSuccess,
    errorCreate,
    userExist,
  });
}

async function saveUser(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const cpassword = req.body.cpassword;

  const [existing_user] = await db.query(
    "SELECT email FROM user WHERE email = ?",
    email
  );

  if (existing_user.length != 0) {
    req.flash("user-exist", "User is aleady exist");
    return res.redirect("/create-account");
  }

  if (password !== cpassword) {
    req.flash("user-exist", "Password are not match");
    return res.redirect("/create-account");
  }

  const data = [name, email, password];

  try {
    await db.query("INSERT INTO user (name, email, password) VALUES(?)", [
      data,
    ]);
    req.flash("create-account-succes", "Account Created Successfully");
  } catch (error) {
    req.flash("errorCreate", error);
  }

  res.redirect("/create-account");
}

async function logoutUser(req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  return res.redirect("/");
}

async function updateRecipe(req, res) {
  const [categories] = await db.query("Select name from category");
  const [[recipe]] = await db.query(
    "SELECT * FROM recipe WHERE id=?",
    req.params.id
  );
  const infoErrorsObj = req.flash("infoErrors");
  const infoSubmitObj = req.flash("infoSubmit");
  res.render("update-recipe", {
    categories,
    recipe,
    infoErrorsObj,
    infoSubmitObj,
    title: "Indian Recipe- Update recipe",
  });
}

async function updateRecipeSubmit(req, res) {
  try {
    const uploadedImage = req.file.path;
    const imagePath = uploadedImage.substring(6);
    const data = [
      req.body.name,
      req.body.description,
      req.body.ingredients,
      req.body.category,
      imagePath,
      req.params.id,
    ];
    await db.query(
      "UPDATE recipe SET name=?, description=?, ingredient=?, category=?, image=? WHERE id=?",
      data
    );
    req.flash("infoSubmit", "Recipe has been Updated.");
    res.redirect("/submit-recipe");
  } catch (error) {
    console.log(error);
  }
}

async function deleteRecipe(req, res) {
  try {
    await db.query("DELETE FROM recipe WHERE id =?", req.params.id);
    res.redirect("/submit-recipe");
  } catch (error) {
    console.log(error);
  }
}

function getAbout(req, res) {
  res.render("about.ejs", { title: "Indian Recipe- About" });
}

module.exports = {
  homepage: homepage,
  exploreCategories: exploreCategories,
  exploreRecipe: exploreRecipe,
  exploreCategoriesByname: exploreCategoriesByname,
  searchResult: searchResult,
  exploreLatest: exploreLatest,
  exploreRandom: exploreRandom,
  getFrom: getFrom,
  submitRecipe: submitRecipe,
  getLoginForm: getLoginForm,
  logInUser: logInUser,
  createAccount: createAccount,
  saveUser: saveUser,
  logoutUser: logoutUser,
  updateRecipe: updateRecipe,
  updateRecipeSubmit: updateRecipeSubmit,
  deleteRecipe: deleteRecipe,
  getAbout: getAbout,
};
