import mysql from "mysql2";
import fs from "fs";
import path from "path";
import config from "../app.config";
require("iconv-lite").encodingExists("foo");

function intiTest(): any {
  const connection = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.test,
    charset: "utf8mb4",
    multipleStatements: true,
  });

  connection.connect((error) => {
    if (error) {
      throw error;
    }
  });
  const executeSqlFile = async (queryPath: string) => {
    let sql: any = fs.readFileSync(queryPath, { encoding: "utf-8" });
    sql = sql.replace(/\r?\n|\r/g, " ");
    connection.query(sql, function (error): any {
      console.log(error);
      if (error) throw error;
      console.log("Archivo SQL ejecutado con éxito");
    });
  };

  const sqlQueryPath = path.join(__dirname, "../src", "db", "script.sql");
  const seedPath = path.join(__dirname, "../src", "db", "seed.sql");
  executeSqlFile(sqlQueryPath);
  executeSqlFile(seedPath);
  connection.end();
}
intiTest();
