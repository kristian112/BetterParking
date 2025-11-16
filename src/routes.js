const express = require("express");
const path = require("path");
const { db } = require("./db/db");
const { Cars } = require("./db/schema");
const { eq } = require("drizzle-orm");
const { sendEmail } = require("./services/emailService");
const cookieParser = require("cookie-parser");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { r2 } = require("./r2");

const upload = multer({ storage: multer.memoryStorage() });

const { Alerts } = require("./db/schema.js");

const checkAdmin = require("./middleware/checkAdmin");
require("dotenv").config();

router.use(cookieParser());
router.use(express.urlencoded({ extended: true }));

router.get("/admin/login", (req, res) => {
  res.render("login");
});

router.post(
  "/admin/login",
  express.urlencoded({ extended: true }),
  (req, res) => {
    const { username, password } = req.body;
    console.log(username);
    console.log(password);
    if (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    ) {
      res.cookie("admin", "1", {
        httpOnly: true,
        sameSite: "strict",
      });

      return res.redirect("/admin/dashboard");
    }

    res.send("Wrong credentials!");
  }
);

router.get("/admin/dashboard", checkAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(Alerts).orderBy(Alerts.id);
    console.log(rows);
    res.render("kukataList", { alerts: rows });
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.redirect("/admin/login");
  }
});

router.get("/admin/alerts/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const results = await db.select().from(Alerts).where(eq(Alerts.id, id));

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "Not found" });
    }
    const alert = results[0];
    res.render("kukataDetails", { alert });
  } catch (err) {
    console.error("Error fetching single alert:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/admin/delete/:id", checkAdmin, (req, res) => {
  db.delete(Alerts).where(eq(Alerts.id, req.params.id)).run();
  res.redirect("/admin/dashboard");
});

// Landing page
router.get("/", (req, res) => {
  res.render("index");
});

// Submit page
router.get("/submit", (req, res) => {
  res.render("submit");
});

// Notify API
router.post("/api/notify", async (req, res) => {
  //console.log(req);
  console.log(req.body);
  //console.log(req.body.otherCarID)

  const { otherCarID, yourCarID } = req.body;
  const cleaned = otherCarID.trim().toUpperCase();
  const yourCarIdCleaned = yourCarID.trim().toUpperCase();

  const car = await db.select().from(Cars).where(eq(Cars.plate, cleaned)).get();
  console.log(car);
  if (!car) {
    return res.status(404).json({ ok: false, message: "Car not found" });
  }

  // Email text
  let emailText = `Вашият автомобил (${cleaned}) пречи. Описание: (${req.body.desc}). \n`;
  //https://www.google.com/maps/search/?api=1&query=LAT,LNG

  let mapsLink = `https://www.google.com/maps/search/?api=1&q=${req.body.latitude},${req.body.longitude} \n`;
  emailText += mapsLink;
  console.log(emailText);
  if (req.body.yourPhone != undefined)
    emailText += `\n Телефон за връзка с сигнализиращия: (${req.body.yourPhone})`;

  // изпращаме имейла
  await db
    .insert(Alerts)
    .values({
      plate: cleaned,
      createdAt: new Date(),
      message: emailText,
      lat: req.body.latitude,
      lng: req.body.longitude,
      photo: req.body.photoURL || null,
      yourPhone: req.body.yourPhone || null,
      email: car.ownerEmail,
      yourCarId: yourCarIdCleaned,
    })
    .run();

  await sendEmail({
    to: car.ownerEmail,
    subject: "Car Alert Notification",
    text: emailText,
  });

  // Future: SMS (Twilio/Firebase)
  // await sendSms(car.ownerPhone, smsText);

  return res.redirect("/");
});

router.post("/api/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = req.file.originalname.split(".").pop();
    const fileName = crypto.randomUUID() + "." + ext;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const publicUrl =
      `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/` +
      `${process.env.R2_BUCKET}/${fileName}`;

    res.json({
      success: true,
      url: publicUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
