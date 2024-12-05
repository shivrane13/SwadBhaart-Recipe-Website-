const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  database: "recipe",
  user: "root",
  password: "gaurav",
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Mysql Connected...");
  } catch (error) {
    console.log(error);
  }
})();

module.exports = pool;
