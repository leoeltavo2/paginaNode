const path = require("path");
const mysql = require("mysql"); //INCLUYE LA LIBRERIA MYSQL, TE DARA ERROR SI NO EJECUTASTE EL NPM INSTALL
const express = require("express");
const bodyParser = require("body-parser");

const hostname = "127.0.0.1";
const port = 3000;

const crypto = require("crypto");
const secret = "12345";

var app = express();

// *******************BASE DE DATOS*********************

var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "1234",
  database: "aceros",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// con.query("SELECT * FROM usuario", function (err, result) {
//   if (err) throw err;
//   console.log(result);
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.use("/public", express.static("public"));

// ***************************login**************************
app.post("/login", function (req, res) {
  var cipher = crypto.createCipher("aes-256-gcm", secret);
  var hashPass = cipher.update(req.body.pass, "utf8", "hex");
  hashPass += cipher.final("hex");
  var id;
  var sql =
    "SELECT * FROM usuario WHERE correo = '" +
    req.body.correo +
    "' AND contraseña = '" +
    hashPass +
    "' ";
  con.query(sql, function (error, results) {
    if (error) {
      throw error;
    } else {
      let flag = false;
      results.forEach((result) => {
        if (
          result.correo === req.body.correo &&
          result.contraseña === hashPass
        ) {
          console.log("LOGIN CORRECTO");
          console.log(result);
          app.get("/usuario", function (req, res) {
            con.query(sql, function (error, results) {
              if (error) {
                throw error;
              } else {
                res.json(results);
              }
            });
          });
          app.use("/", express.static("public"));
          res.sendFile(path.join(__dirname, "public/logueado.html"));
          flag = true;
        }
      });
      if (!flag) {
        res.end(
          "<h1 style='text-align:center;'>LA CUENTA NO EXISTE O TIENE MAL EL USUARIO Y/O CLAVE</h1>"
        );
      }
    }
  });
});

// **************************** insertar*************************
app.post("/registrar", function (req, res) {
  var cipher = crypto.createCipher("aes-256-gcm", secret);
  var rhash = cipher.update(req.body.rpass, "utf8", "hex");
  rhash += cipher.final("hex");
  con.query(
    "SELECT usuario, correo FROM usuario WHERE usuario = ? or correo = ? ",
    [req.body.ruser, req.body.rcorreo],
    function (err, results) {
      if (err) {
        throw err;
      }

      if (Object.entries(results).length === 0) {
        var sql =
          "INSERT INTO usuario VALUES(null,'" +
          req.body.nombre +
          "','" +
          req.body.apellido +
          "','" +
          req.body.ruser +
          "','" +
          req.body.rcorreo +
          "','" +
          rhash +
          "')";

        var query = con.query(sql, function (error, results) {
          if (error) {
            throw error;
          } else {
            console.log("USUARIO REGISTRADO!");
            res.sendFile(path.join(__dirname, "index.html"));
          }
        });
      } else {
        console.log("NO SE GUARDO EL USUARIO.");
        res.redirect("/public/registrar.html");
      }
    }
  );
});

// **************************** olvide*************************
app.post("/olvide", function (req, res) {
  var sql = "SELECT * FROM usuario WHERE correo = '" + req.body.email + "'";
  con.query(sql, function (error, results) {
    if (error) {
      throw error;
    } else {
      let flag = false;
      results.forEach((result) => {
        if (result.correo === req.body.email) {
          console.log("CORREO CORRECTO");

          var decipher = crypto.createDecipher("aes-256-gcm", secret);
          var pass = decipher.update(result.contraseña, "hex", "utf8");
          res.send(
            "<h1 style='text-align:center;'>tu contraseña es: </h1>" +
              "<h2 style = 'color:red; text-align:center;'>" +
              pass +
              "</h2>" +
              "<br><br>" +
              "<a href='../'>Regresar</a>"
          );
          flag = true;
        }
      });
      if (!flag) {
        res.end(
          "<h1 style='text-align:center;'>LA DIRECCIÓN DE CORREO NO HA SIDO REGISTRADA POR EL MOMENTO </h1>"
        );
      }
    }
  });
});

app.listen(port, hostname, function () {
  console.log(`Server running at http://${hostname}:${port}/`);
});
