const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const port = 3000;
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloud = async (bufferFile) => {
  try {
    if (!bufferFile) {
      console.error("no file found");
    }
    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(bufferFile);
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

const { MongoClient, ServerApiVersion } = require("mongodb");
const { default: axios } = require("axios");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8hyfw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const docsCollection = client.db("italyVisa").collection("docs");

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

    app.post(
      "/upload",
      upload.fields([
        { name: "image" },
        { name: "pdf1" },
        { name: "pdf2" },
        { name: "pdf3" },
        { name: "pdf4" },
        { name: "pdf5" },
        { name: "pdf6" },
        { name: "pdf7" },
        { name: "pdf8" },
      ]),
      async (req, res) => {
        const {
          surname,
          givenName,
          date,
          city,
          identy,
          nationality,
          nid,
          companyName,
          jobTitle,
          dutyDuration,
          salary,
          passportNum,
          issuedCountry,
          phoneNum,
          email,
          note,
          gender,
        } = req.body;

        const image = req.files["image"][0];
        // Upload image to ImgBB
        const imageFormData = new FormData();
        imageFormData.append("image", image.buffer.toString("base64"));

        const imgbbResponse = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          imageFormData
        );
        const imageUrl = imgbbResponse.data.data.url;

        const pdf1 = req.files.pdf1 ? req.files.pdf1[0]?.buffer : null;
        const pdf2 = req.files.pdf2 ? req.files.pdf2[0]?.buffer : null;
        const pdf3 = req.files.pdf3 ? req.files.pdf3[0]?.buffer : null;
        const pdf4 = req.files.pdf4 ? req.files.pdf4[0]?.buffer : null;
        const pdf5 = req.files.pdf5 ? req.files.pdf5[0]?.buffer : null;
        const pdf6 = req.files.pdf6 ? req.files.pdf6[0]?.buffer : null;
        const pdf7 = req.files.pdf7 ? req.files.pdf7[0]?.buffer : null;
        const pdf8 = req.files.pdf8 ? req.files.pdf8[0]?.buffer : null;
        let doc1;
        let doc2;
        let doc3;
        let doc4;
        let doc5;
        let doc6;
        let doc7;
        let doc8;
        if (pdf1) {
          doc1 = await uploadOnCloud(pdf1);
        }
        if (pdf2) {
          doc2 = await uploadOnCloud(pdf2);
        }
        if (pdf3) {
          doc3 = await uploadOnCloud(pdf3);
        }
        if (pdf4) {
          doc4 = await uploadOnCloud(pdf4);
        }
        if (pdf5) {
          doc5 = await uploadOnCloud(pdf5);
        }
        if (pdf6) {
          doc6 = await uploadOnCloud(pdf6);
        }
        if (pdf7) {
          doc7 = await uploadOnCloud(pdf7);
        }
        if (pdf8) {
          doc8 = await uploadOnCloud(pdf8);
        }

        let cloudArr = [doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8];

        let document = {
          imageUrl,
          cloudArr,
          surname,
          givenName,
          gender,
          date,
          city,
          identy,
          nationality,
          nid,
          companyName,
          jobTitle,
          dutyDuration,
          salary,
          passportNum,
          issuedCountry,
          phoneNum,
          email,
          note,
        };

        const result = await docsCollection.insertOne(document);
        res.send(result);
      }
    );

    app.get("/check/:passportNum", async (req, res) => {
      const passportNum = req.params.passportNum;
      const query = { passportNum: passportNum };
      const result = await docsCollection.findOne(query);
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
