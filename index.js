const express = require("express");
const app = express();
const port = process.env.port || 5000;
const cors = require("cors");
require('dotenv').config()

const { ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world Book-project!");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    
    await client.connect();

    
    const booksCollections = client.db("BookInventory").collection("books");


    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      const result = await booksCollections.insertOne(data);
      res.send(result);
    });

    
    app.get("/all-books",async(req, res)=>{
        const books =  booksCollections.find();
        const result = await books.toArray();
        res.send(result); 
    })

    
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      
      const updateBookData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: { ...updateBookData },
      };

      const result = await booksCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await booksCollections.deleteOne(filter);
      res.send(result);
    });

    
    app.get("/all-books/:category", async (req, res) => {
      try {
        const category = req.params.category;
        const query = { Category: { $regex: new RegExp(`^${category}$`, 'i') } };

        const result = await booksCollections.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching books by category" });
      }
    });

    
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await booksCollections.findOne(filter);
      res.send(result);
    });

    
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});