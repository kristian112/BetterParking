async function sendSms(phone, message) {
  console.log(`[FAKE SMS] To: ${phone} | Message: ${message}`);
  return { ok: true };
}

module.exports = { sendSms };