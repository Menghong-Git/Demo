import express, { json } from "express";
import db from "./database.js";

const app = express(); // is the express module written express team
const port = 3000;

app.use(express.json());

app.use(express.static("public"));

function myFirstMiddleware(req, res, next) {
  console.log(`Request recieved for ${req.method} ${req.url}`);
  req.myCustomerRequest = "this is from middleware";
  next();
}

function authentication(req, res, next) {
  // 1. check if user exists in our database
  // 2. if user provides correct both username and password
  const user = db.findOne("users", { username: req.headers.username });
  if (user === null) {
    return res
      .status(403)
      .json({ message: "You are not allowed to use this api" });
  } else {
    if (user.password !== req.headers.password) {
      return res
        .status(403)
        .json({
          message: "You are not allowed to use this api - with wrong password",
        });
    }
  }
  req.user = user;
  next();
}

app.post("/create-notes", authentication, (req, res) => {
  let note = req.body;
  note.userId = req.user.id;
  db.add("notes", note);
  return res.json({ message: "You have created a note." });
});

app.get("/notes", authentication, (req, res) => {
  const userId = req.user.id;
  const notes = db.find("notes", { userId: userId });
  return res.json(notes);
});

app.put("/note", authentication, (req, res) => {
  let note = db.findOne("notes", { id: req.body.id });
  if (req.user.id !== note.userId) {
    return res.status(401).json({ message: "You cannot update other's note" });
  }
  db.update("notes", req.body.id, { completed: true });
  return res.status(200).json({ message: "You have completed your note" });
});

app.get("/test-middleware", authentication, (req, res) => {
  console.log(req.user);
  return res.send("This is my test middleware api");
});

app.get("/test-no-middleware", (req, res) => {
  console.log(req.myCustomerRequest);
  return res.send("This is my test middleware api");
});

app.post("/register", (req, res) => {
  const user = db.findOne("users", { username: req.body.username });
  if (user) {
    return res.status(403).json({ message: "username already exists" });
  }
  db.add("users", req.body);
  res.status(201).json({ message: "user created" });
});

app.post("/login", (req, res) => {
  // req - sent by postman // res - send back by us
  const user = db.findOne("users", { username: req.body.username });
  if (user === null) {
    return res.status(401).json({ message: "user doesn't exist" });
  }

  if (user.password !== req.body.password) {
    return res.status(401).json({ message: "wrong credentials" });
  }

  res.status(200).json(user);
});

app.put("/update-profile", (req, res) => {
  let user = db.getById("users", req.body.id);
  if (user === undefined) {
    return res
      .status(401)
      .json({ message: "you cannot update non-exited user" });
  }
  user = db.update("users", req.body.id, req.body);
  res.status(200).json(user);
});

app.get("/products", (req, res) => {
  let products = db.getAll("products");
  return res.status(200).json(products);
});

app.post("/product", (req, res) => {
  db.add("products", req.body);
  return res.status(200).json({ message: "New product created" });
});

app.listen(port, () => {
  console.log(`Jolt Sport Project app is running on http://localhost:${port}`);
});
