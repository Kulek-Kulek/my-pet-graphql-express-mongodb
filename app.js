const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) return err;

      const data = err.originalError.data;
      const message = err.message || "Something went wrong!";
      const code = err.originalError.code || 500;
      return {
        message,
        status: code,
        data,
      };
    },
  })
);

app.use((err, _, res, _1) => {
  res.status(500).json({ message: err.message || "Something went wrong." });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1d46oe4.mongodb.net/?retryWrites=true&w=majority`
  )
  .then((result) => {
    app.listen(8080);
    console.log("working...");
  })
  .catch((err) => console.log(err));
