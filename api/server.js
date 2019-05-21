const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");
const KnexSessionsStore = require("connect-session-knex")(session);

const server = express();

const sessionConfig = {
  name: "monster", // defaults to sid, but we should change this as that clues in on our stack
  secret: "keep it safe, keep it secret -gandalf", // used to encrypt/decrypt the cookie (use a .env file here)
  cookie: {
    maxAge: 1000 * 60 * 60, // (this is 1 hr) how long the session is valid for in millisec
    secure: false // used for https only communications, should be true in production
  },
  httpOnly: true, // cannot access the cookie from JS using document.cookie
  // keep this to true unless you have a very good reason to not have it as true
  resave: false, // keep it false to avoid recreating sessions that have not changed
  saveUninitialized: false, // GDPR Laws against setting cookies automatically

  // we add this to configure the way sessions are stored
  store: new KnexSessionsStore({
    knex: require("../database/dbConfig"), // configures the instance of knex
    tablename: "sessions", // table that will store sessions inside the db, name it anything we want
    sidfieldname: "sid", // column that will hold the session id, name this whatever we want
    createtable: true, // if the table does not exist, it will be created automatically for us
    clearInterval: 1000 * 60 * 60 //the amount of time before checking old sessions and removing them from te database to keep everything clean and performant
  })
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.send("It's alive!");
});

module.exports = server;

// resulting database entry for the  session
// {"cookie": {
//     "originalMaxAge":3600000,
//     "expires":"2019-05-21T18:43:33.664Z",
//     "secure":false,
//     "httpOnly":true,
//     "path":"/"
//   },
//   "user": {
//     "id":1,
//     "username":"sam",
//     "password":"$2a$10$AYYoF245l8SAxu7./x40fuOngXfXpDtW6PwmC9xs1MW9k1ZJRrLAy"
//   }
// }