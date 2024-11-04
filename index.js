import express from "express";
const app = express();
import cors from "cors";
import multer from "multer";
const port = 3000;
import "dotenv/config";
import createError from "http-errors";

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

import connectDB, { client } from "./src/config/db.js";
import { deleteFromCloud, uploadOnCloud } from "./src/cloudinary.js";
import { ObjectId } from "mongodb";
const db_name = "canadaVisa";
const docsCollection = client.db(db_name).collection("docs");

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
  ]),
  async (req, res, next) => {
    const { surname, givenName, date, status, passportNum, email } = req.body;

    try {
      const prevResult = await docsCollection.findOne({
        passportNum: passportNum,
      });

      if (prevResult?.passportNum == passportNum) {
        throw createError(
          400,
          "You already uploaded a document for this passport"
        );
      }

      const image = req?.files?.image ? req?.files?.image[0]?.buffer : null;

      const pdf1 = req.files.pdf1 ? req.files.pdf1[0]?.buffer : null;
      const pdf2 = req.files.pdf2 ? req.files.pdf2[0]?.buffer : null;
      const pdf3 = req.files.pdf3 ? req.files.pdf3[0]?.buffer : null;
      const pdf4 = req.files.pdf4 ? req.files.pdf4[0]?.buffer : null;
      const pdf5 = req.files.pdf5 ? req.files.pdf5[0]?.buffer : null;
      const pdf6 = req.files.pdf6 ? req.files.pdf6[0]?.buffer : null;
      let photo;
      let doc1;
      let doc2;
      let doc3;
      let doc4;
      let doc5;
      let doc6;
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

      let cloudArr = [photo, doc1, doc2, doc3, doc4, doc5, doc6];
      let cloudDoc = cloudArr?.filter((data) => data !== undefined);
      let finalCloudDoc = [];
      cloudDoc?.map((doc) =>
        finalCloudDoc?.push({
          publicId: doc?.public_id,
          fileUrl: doc?.secure_url,
        })
      );
      let document = {
        finalCloudDoc,
        surname,
        givenName,
        date,
        status,
        passportNum,
        email,
      };

      const result = await docsCollection.insertOne(document);

      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

app.get("/allDocs", async (req, res) => {
  const result = await docsCollection.find().toArray();
  res.send(result);
});

app.get("/check/:passportNum", async (req, res, next) => {
  try {
    const { passportNum } = req?.params;
    const query = { passportNum: passportNum };
    const result = await docsCollection.findOne(query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
app.put(
  "/upload/:passNum",
  upload.fields([{ name: "pdf9" }, { name: "pdf10" }]),
  async (req, res, next) => {
    const { passNum } = req.params;
    try {
      const prevData = await docsCollection.findOne({ passportNum: passNum });

      const pdf9 = req.files.pdf9 ? req.files.pdf9[0]?.buffer : null;
      const pdf10 = req.files.pdf10 ? req.files.pdf10[0]?.buffer : null;
      let doc9;
      let doc10;

      if (pdf9) {
        doc9 = await uploadOnCloud(pdf9);
        prevData.finalCloudDoc.push({
          publicId: doc9?.public_id,
          fileUrl: doc9?.secure_url,
        });
      }
      if (pdf10) {
        doc10 = await uploadOnCloud(pdf10);
        prevData.finalCloudDoc.push({
          publicId: doc10?.public_id,
          fileUrl: doc10?.url,
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
    } catch (error) {
      next(error);
    }
  }
);

app.delete("/deleteData/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await docsCollection.findOne(query);

    const publicIds = result?.finalCloudDoc?.map((info) => info.publicId);
    if (publicIds && publicIds.length > 0) {
      const deleteRes = await deleteFromCloud(publicIds);
      if (deleteRes[0].result == "ok") {
        const deletedResult = await docsCollection.deleteOne(query);
        res.send(deletedResult);
      }
    }
  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Server is running",
  });
});

//client error handling
app.use((req, res, next) => {
  next(createError(404, "Route not found!"));
});

//server error handling
app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});
app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  await connectDB();
});
