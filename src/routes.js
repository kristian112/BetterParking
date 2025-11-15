const express = require("express");
const path = require("path");
const { db } = require("./db/db");
const { Cars } = require("./db/schema");
const { eq } = require("drizzle-orm");
const { sendSms } = require("./services/smsService");

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
router.post("/api/notify", (req, res) => {
  const { plate } = req.body;

  if (!plate || typeof plate !== "string" || !plate.trim()) {
    return res.status(400).json({ ok: false, message: "Invalid plate" });
  }

  const cleaned = plate.trim().toUpperCase();

  try {
    const car = db
      .select()
      .from(Cars)
      .where(eq(Cars.plate, cleaned))
      .get();

    if (!car) {
      return res.status(404).json({ ok: false, message: "Car not found" });
    }

    const smsText = `Вашият автомобил с номер ${cleaned} пречи на друг автомобил. Моля, преместете го.`;

    sendSms(car.ownerPhone, smsText)
      .then(() => res.json({ ok: true, message: "SMS sent (fake)" }))
      .catch(() => res.status(500).json({ ok: false, message: "SMS failed" }));

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

module.exports = router;