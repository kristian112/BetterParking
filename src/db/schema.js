const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const Cars = sqliteTable("cars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plate: text("plate").notNull().unique(),

  ownerPhone: text("owner_phone").notNull(),
  ownerEmail: text("owner_email").notNull()
});

module.exports = { Cars };
