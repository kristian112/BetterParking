const { db } = require("./db");
const { Cars } = require("./schema");

function seed() {
  console.log("Seeding...");

  // изтриваме всички записи
  db.delete(Cars).run();

  // добавяме примерни коли
  db.insert(Cars)
    .values([
      { plate: "CA1234AB", ownerPhone: "+359881111111" },
      { plate: "CB9876CC", ownerPhone: "+359882222222" },
      { plate: "PB4444PP", ownerPhone: "+359883333333" },
      { plate: "TX7777TX", ownerPhone: "+359884444444" }
    ])
    .run();

  console.log("Seed done.");
}

seed();