const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const port = 3000;
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { default: axios } = require("axios");

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
const deleteFromCloud = async (publicIds) => {
  try {
    if (!Array.isArray(publicIds) || publicIds.length == 0) {
      return null;
    }
    const responses = await Promise.all(
      publicIds?.map((id) => cloudinary.uploader.destroy(id))
    );
    return responses;
  } catch (error) {
    return null;
    console.log(error);
  }
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    // await client.connect();

    const docsCollection = client.db("canadaVisa").collection("docs");

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
          status,
          passportNum,
          issuedCountry,
          phoneNum,
          email,
          note,
          gender,
        } = req.body;

        const prevResult = await docsCollection.findOne({
          passportNum: passportNum,
        });
        if (prevResult?.passportNum == passportNum) {
          res.send({
            message: "You already uploaded a document for this passport",
          });
          return;
        }

        const image = req.files.image ? req.files.image[0]?.buffer : null;

        const pdf1 = req.files.pdf1 ? req.files.pdf1[0]?.buffer : null;
        const pdf2 = req.files.pdf2 ? req.files.pdf2[0]?.buffer : null;
        const pdf3 = req.files.pdf3 ? req.files.pdf3[0]?.buffer : null;
        const pdf4 = req.files.pdf4 ? req.files.pdf4[0]?.buffer : null;
        const pdf5 = req.files.pdf5 ? req.files.pdf5[0]?.buffer : null;
        const pdf6 = req.files.pdf6 ? req.files.pdf6[0]?.buffer : null;
        const pdf7 = req.files.pdf7 ? req.files.pdf7[0]?.buffer : null;
        const pdf8 = req.files.pdf8 ? req.files.pdf8[0]?.buffer : null;
        let photo;
        let doc1;
        let doc2;
        let doc3;
        let doc4;
        let doc5;
        let doc6;
        let doc7;
        let doc8;
        if (image) {
          photo = await uploadOnCloud(image);
        }
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

        let cloudArr = [photo, doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8];
        let cloudDoc = cloudArr.filter((data) => data !== undefined);
        let finalCloudDoc = [];
        cloudDoc.map((doc) =>
          finalCloudDoc.push({ publicId: doc.public_id, fileUrl: doc.url })
        );
        let document = {
          finalCloudDoc,
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
          status,
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

    app.put(
      "/upload/:passNum",
      upload.fields([
        { name: "pdf9" },
        { name: "pdf10" },
        { name: "pdf11" },
        { name: "pdf12" },
      ]),
      async (req, res) => {
        const passNum = req.params.passNum;
        const prevData = await docsCollection.findOne({ passportNum: passNum });

        const pdf9 = req.files.pdf9 ? req.files.pdf9[0]?.buffer : null;
        const pdf10 = req.files.pdf10 ? req.files.pdf10[0]?.buffer : null;
        const pdf11 = req.files.pdf11 ? req.files.pdf11[0]?.buffer : null;
        const pdf12 = req.files.pdf12 ? req.files.pdf12[0]?.buffer : null;
        let doc9;
        let doc10;
        let doc11;
        let doc12;

        if (pdf9) {
          doc9 = await uploadOnCloud(pdf9);
          prevData.finalCloudDoc.push({
            publicId: doc9?.public_id,
            fileUrl: doc9?.url,
          });
        }
        if (pdf10) {
          doc10 = await uploadOnCloud(pdf10);
          prevData.finalCloudDoc.push({
            publicId: doc10?.public_id,
            fileUrl: doc10?.url,
          });
        }
        if (pdf11) {
          doc11 = await uploadOnCloud(pdf11);
          prevData.finalCloudDoc.push({
            publicId: doc11?.public_id,
            fileUrl: doc11?.url,
          });
        }
        if (pdf12) {
          doc12 = await uploadOnCloud(pdf12);
          prevData.finalCloudDoc.push({
            publicId: doc12?.public_id,
            fileUrl: doc12?.url,
          });
        }
        const filter = { passportNum: passNum };
        const options = { upsert: true };
        const updatedDoc = {
          $set: { finalCloudDoc: prevData.finalCloudDoc },
        };
        const result = await docsCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      }
    );

    app.get("/check/:passportNum", async (req, res) => {
      const passportNum = req.params.passportNum;
      const query = { passportNum: passportNum };
      const result = await docsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/deleteData/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await docsCollection.findOne(query);

        const publicIds = result.finalCloudDoc.map((info) => info.publicId);
        console.log(publicIds);

        if (publicIds && publicIds.length > 0) {
          const deleteRes = await deleteFromCloud(publicIds);
          if (deleteRes[0].result == "ok") {
            console.log("done");
            const deletedResult = await docsCollection.deleteOne(query);
            res.send(deletedResult);
          }
        }
      } catch (error) {
        res.send("error");
      }
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
  res.send("canada visa server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
