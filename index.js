const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const port = 3000;
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
// console.log(process.env.IMGBB_API_KEY)

const upload = multer({ storage: multer.memoryStorage() });

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const { default: axios } = require("axios");
// const { pdfUpload } = require("./pdfUpload");
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
        } = req.body;
        // const image = req.files["image"] ? req.files["image"][0] : null;
        // const pdf = req.files["pdf"] ? req.files["pdf"][0] : null;

        // const { surname, date } = req.body;
        const image = req.files["image"][0];
        const pdf1 = req.files["pdf1"];
        const pdf2 = req.files["pdf2"];
        const pdf3 = req.files["pdf3"];
        const pdf4 = req.files["pdf4"];
        const pdf5 = req.files["pdf5"];
        const pdf6 = req.files["pdf6"];
        const pdf7 = req.files["pdf7"];
        const pdf8 = req.files["pdf8"];

        let pdfs = [pdf1, pdf2, pdf3, pdf4, pdf5, pdf6, pdf7, pdf8];
        console.log(pdfs);

        // Upload image to ImgBB
        const imageFormData = new FormData();
        imageFormData.append("image", image.buffer.toString("base64"));

        const imgbbResponse = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          imageFormData
        );

        const imageUrl = imgbbResponse.data.data.url;

        let doc = {
          imageUrl,
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

        // console.log(date, surname);
        // if (image) console.log("Image:", image);
        // if (pdf) console.log("PDF:", pdf.path);

        // You can now store this information in a database, process files, etc.

        // const pdfUrls = await Promise.all(
        //   pdfs.map(async (i,pdf) => {
        //     const result = await new Promise((resolve, reject) => {
        //       const uploadStream = cloudinary.uploader.upload_stream(
        //         { resource_type: "raw" },
        //         (error, result) => {
        //           if (error) reject(error);
        //           else resolve(result);
        //         }
        //       );
        //       uploadStream.end(`pdf${i}`.buffer);
        //     });
        //     console.log(pdfUrls);

        //     return result.secure_url;
        //   })
        // );

        // try {
        //   const result = await cloudinary.uploader
        //     .upload_stream((error, result) => {
        //       if (error) {
        //         return res
        //           .status(500)
        //           .json({ message: "Upload failed", error });
        //       }
        //       res.json({ message: "Upload successful", result });
        //     })
        //     .end(req.file.buffer);
        // } catch (error) {
        //   res.status(500).json({ message: "Server error", error });
        // }
        const result = await docsCollection.insertOne(doc);
        res.send(result);

        // res.status(200).json({ message: "Form submitted successfully!" });
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
