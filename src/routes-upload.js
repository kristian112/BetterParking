const express = require("express");
const crypto = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const router = express.Router();

// R2 client
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

// 👉 GET /upload-url
router.get("/upload-url", async (req, res) => {
  const ext = req.query.ext || "jpg";
  const type = req.query.type || "image/jpeg";

  const fileName = crypto.randomUUID() + "." + ext;

  const command = new PutObjectCommand({
    Bucket: "kofa",
    Key: fileName,
    ContentType: type,
  });

  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

  res.json({
    uploadURL: signedUrl,
    publicUrl: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/kofa/${fileName}`,
  });
});

module.exports = router;
