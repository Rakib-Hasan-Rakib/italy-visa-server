const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://italyVisa:0tltQoo3s4j8sJns@cluster0.umvg5wn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const usersCollection = client.db("italyVisa").collection("users");

    // Save user email and role in DB
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("italy visa server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
