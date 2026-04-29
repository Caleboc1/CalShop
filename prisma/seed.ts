import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@acctmarket.com" },
    update: {},
    create: { email: "admin@acctmarket.com", password: adminPass, name: "Admin", role: "ADMIN" },
  });
  console.log("✓ Admin:", admin.email);

  const categories = [
    { name: "Facebook Accounts", slug: "facebook", icon: "📘" },
    { name: "Instagram Accounts", slug: "instagram", icon: "📸" },
    { name: "TikTok Accounts", slug: "tiktok", icon: "🎵" },
    { name: "Twitter/X Accounts", slug: "twitter", icon: "✖️" },
    { name: "Gmail Accounts", slug: "gmail", icon: "📧" },
    { name: "LinkedIn Accounts", slug: "linkedin", icon: "💼" },
    { name: "Snapchat Accounts", slug: "snapchat", icon: "👻" },
    { name: "Discord Accounts", slug: "discord", icon: "🎮" },
    { name: "Dating Accounts", slug: "dating", icon: "💕" },
    { name: "Virtual Numbers", slug: "numbers", icon: "📱" },
  ];

  for (const [i, cat] of categories.entries()) {
    const existing = await prisma.category.findFirst({ where: { slug: cat.slug } });
    const category = existing ?? await prisma.category.create({ data: { ...cat, sortOrder: i } });

    const count = await prisma.product.count({ where: { categoryId: category.id } });
    if (count === 0) {
      await prisma.product.createMany({
        data: [
          { categoryId: category.id, name: `${cat.name.replace(" Accounts", "")} | Basic | Aged`, description: "Aged account. Ready to use.", price: 2500 + i * 300, stockCount: 50, isActive: true },
          { categoryId: category.id, name: `${cat.name.replace(" Accounts", "")} | Premium | Verified`, description: "Verified premium account with history.", price: 6000 + i * 500, stockCount: 20, isActive: true },
          { categoryId: category.id, name: `🇳🇬 ${cat.name.replace(" Accounts", "")} | Nigeria | Real`, description: "100% Nigerian profile.", price: 9500 + i * 400, stockCount: 10, isActive: true },
        ],
      });
      console.log(`  ✓ Products seeded for: ${cat.name}`);
    }
  }

  console.log("\n✅ Seed complete!");
  console.log("   Admin: admin@acctmarket.com / admin123");
  console.log("   ⚠️  Change the admin password after first login!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
