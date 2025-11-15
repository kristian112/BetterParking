const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const Cars = sqliteTable("cars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plate: text("plate").notNull().unique(),

  ownerPhone: text("owner_phone").notNull(),
  ownerEmail: text("owner_email").notNull()
});

const Alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plate: text("plate").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  message: text("message").notNull(),
  lat: text("lat"),       // nullable
  lng: text("lng"),
  photo: text("photo")    // path към снимка (кога решите)
});

module.exports = { Cars, Alerts };

