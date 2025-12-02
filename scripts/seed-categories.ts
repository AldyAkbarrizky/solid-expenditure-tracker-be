import { db } from "../src/db";
import { categories } from "../src/db/schema";
import { sql } from "drizzle-orm";

const categoryData = [
  { name: "Makanan & Minuman", icon: "utensils", color: "#FF6B6B" },
  { name: "Belanja Bulanan", icon: "shopping-bag", color: "#4ECDC4" },
  { name: "Transportasi", icon: "car", color: "#45B7D1" },
  { name: "Tagihan & Utilitas", icon: "zap", color: "#F7B731" },
  { name: "Hiburan", icon: "film", color: "#A55EEA" },
  { name: "Kesehatan", icon: "heart", color: "#FC5C65" },
  { name: "Pendidikan", icon: "book", color: "#26DE81" },
  { name: "Hadiah & Donasi", icon: "gift", color: "#FD9644" },
  { name: "Investasi", icon: "briefcase", color: "#20BF6B" },
  { name: "Lainnya", icon: "more-horizontal", color: "#95A5A6" },
  { name: "Jajan", icon: "coffee", color: "#D980FA" },
  { name: "Pulsa & Data", icon: "smartphone", color: "#12CBC4" },
  { name: "Rumah Tangga", icon: "home", color: "#FFC312" },
  { name: "Elektronik", icon: "smartphone", color: "#5758BB" },
  { name: "Pakaian", icon: "shopping-bag", color: "#ED4C67" },
];

async function seed() {
  console.log("Seeding categories...");
  
  try {
    for (const cat of categoryData) {
      await db
        .insert(categories)
        .values({
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        })
        .onDuplicateKeyUpdate({
          set: {
            icon: cat.icon,
            color: cat.color,
            isDefault: true,
          },
        });
    }
    console.log("Categories seeded successfully!");
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    process.exit(0);
  }
}

seed();
