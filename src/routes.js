const express = require("express");
const path = require("path");
const { db } = require("./db/db");
const { Cars } = require("./db/schema");
const { eq } = require("drizzle-orm");
const { sendEmail } = require("./services/emailService");

const router = express.Router();



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
  let emailText = `Вашият автомобил (${cleaned}) пречи. Описание: (${req.body.description}).`;
  console.log(emailText)
  if(req.body.yourPhone != undefined) 
    emailText += `Телефон за връзка с сигнализиращия: (${req.body.yourPhone})`

  // изпращаме имейла
  await sendEmail({
    to: car.ownerEmail,
    subject: "Car Alert Notification",
    text: emailText
  });

  // Future: SMS (Twilio/Firebase)
  // await sendSms(car.ownerPhone, smsText);

  return res.json({ ok: true, message: "Email sent" });
});

module.exports = router;