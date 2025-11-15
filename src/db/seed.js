const { db } = require("./db");
const { Cars } = require("./schema");

function seed() {
  console.log("Seeding...");

  db.delete(Cars).run();

  db.insert(Cars)
    .values([
      {
        plate: "CA1234AB",
        ownerPhone: "+359881111111",
        ownerEmail: "owner1@example.com"
      },
      {
        plate: "CB9876CC",
        ownerPhone: "+359882222222",
        ownerEmail: "owner2@example.com"
      },
      {
        plate: "PB4444PP",
        ownerPhone: "+359883333333",
        ownerEmail: "owner3@example.com"
      }
    ])
    .run();

  console.log("Seed done.");
}

seed();
