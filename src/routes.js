const express = require("express");
const path = require("path");
const { db } = require("./db/db");
const { Cars } = require("./db/schema");
const { eq } = require("drizzle-orm");
const { sendEmail } = require("./services/emailService");
const cookieParser = require("cookie-parser");
const router = express.Router();

const { Alerts } = require("./db/schema");

const checkAdmin = require("./middleware/checkAdmin");
require("dotenv").config();

router.use(cookieParser());
router.use(express.urlencoded({ extended: true }));


router.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin_login.html"));
});

router.post("/admin/login", express.urlencoded({ extended: true }), (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    res.cookie("admin", "1", {
      httpOnly: true,
      sameSite: "strict"
    });

    return res.redirect("/admin/dashboard");
  }

  res.send("Wrong credentials!");
});


router.get("/admin/dashboard", checkAdmin, (req, res) => {
  const rows = db.select().from(Alerts).all();

  let html = `
  <html>
  <head>
    <title>Admin Dashboard</title>
    <style>
      table, td, th { border: 1px solid black; padding: 4px; }
      table { border-collapse: collapse; }
    </style>
  </head>
  <body>
    <h1>Alerts Dashboard</h1>
    <table>
      <tr>
        <th>ID</th>
        <th>Plate</th>
        <th>Time</th>
        <th>Message</th>
        <th>Action</th>
      </tr>
  `;

  rows.forEach(a => {
    html += `
      <tr>
        <td>${a.id}</td>
        <td>${a.plate}</td>
        <td>${new Date(a.createdAt).toLocaleString()}</td>
        <td>${a.message}</td>
        <td><a href="/admin/delete/${a.id}">Delete</a></td>
      </tr>
    `;
  });

  html += `
    </table>
  </body>
  </html>
  `;

  res.send(html);
});


router.get("/admin/delete/:id", checkAdmin, (req, res) => {
  db.delete(Alerts).where(eq(Alerts.id, req.params.id)).run();
  res.redirect("/admin/dashboard");
});



// Landing page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Submit page
router.get("/submit", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "submit.html"));
});



// Notify API
router.post("/api/notify", async (req, res) => {
  //console.log(req);
  console.log(req.body)
  //console.log(req.body.otherCarID)

  const { otherCarID } = req.body;
  const cleaned = otherCarID.trim().toUpperCase();

  const car = await db.select().from(Cars).where(eq(Cars.plate, cleaned)).get();
  console.log(car)
  if (!car) {
    return res.status(404).json({ ok: false, message: "Car not found" });
  }

  // Email text
  let emailText = `Вашият автомобил (${cleaned}) пречи. Описание: (${req.body.description}). `;
  //https://www.google.com/maps/search/?api=1&query=LAT,LNG

  let mapsLink = `https://www.google.com/maps/search/?api=1&q=${req.body.latitude},${req.body.longitude}`
  emailText+=mapsLink
  console.log(emailText)
  if(req.body.yourPhone != undefined) 
    emailText += `Телефон за връзка с сигнализиращия: (${req.body.yourPhone})`

  // изпращаме имейла
  await sendEmail({
    to: car.ownerEmail,
    subject: "Car Alert Notification",
    text: emailText
  });

  const { Alerts } = require("./db/schema");

  await db.insert(Alerts).values({
  plate: cleaned,
  createdAt: new Date(),
  message: emailText

  }).run();


  // Future: SMS (Twilio/Firebase)
  // await sendSms(car.ownerPhone, smsText);

  return res.json({ ok: true, message: "Email sent" });
});

module.exports = router;