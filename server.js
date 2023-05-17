import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import errorData from "./data/errors.json";

// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
// import avocadoSalesData from "./data/avocado-sales.json";
// import booksData from "./data/books.json";
// import goldenGlobesData from "./data/golden-globes.json";
// import netflixData from "./data/netflix-titles.json";
// import topMusicData from "./data/top-music.json";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();
// npm install express-list-endpoints
const listEndpoints = require('express-list-endpoints')

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Schema - data structure blueprint

const { Schema } = mongoose;
const errorSchema = new Schema ({
  id: Number,
  code: Number,
  message: String,
  length: Number,
  displayMessage: String,
})

// Create a model based on schema

const Error = mongoose.model("Error", errorSchema)

if (process.env.RESET_DB) {
  const resetDatabase = async () => {
    await Error.deleteMany();
    errorData.forEach((singleError) => {
      const newError = new Error (singleError)
      newError.save()
    })
  }
  resetDatabase()
}

// Start defining your routes here
app.get("/", (req, res) => {
  res.json(listEndpoints(app));
});

// Route to a single error messasge
// Id refers to the object-id, which can be found in compass

app.get("/errors/id/:id", async (req, res) => {
  try {
    const singleError = await Error.findById(req.params.id)
    if (singleError) {
      res.status(200).json({
        success: true,
        body: singleError
      })
    } else {
      res.status(404).json({
        success: false,
        body: {
          message: "Error not found"
        }
      })
    }
  } catch(e) {
    res.status(404).json({
      success: false,
      body: {
        message: e
      }
    })
  }
});

// Route to a collection of errors 
// Errors that have the same property length
app.get("/errors/length/:length", async (req, res) => {
  const requestedLength = parseInt(req.params.length);

  try {
    const errorCollection = await Error.find({ length: requestedLength });

    if (errorCollection.length > 0) {
      res.status(200).json({
        success: true,
        body: errorCollection
      });
    } else {
      res.status(404).json({
        success: false,
        body: {
          message: "Error collection not found for the requested length"
        }
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      body: {
        message: e
      }
    });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});