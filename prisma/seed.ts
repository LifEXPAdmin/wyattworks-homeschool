/**
 * Database Seeding Script
 *
 * Seeds the database with sample templates and initial data.
 * Run with: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed Templates
  console.log("📄 Creating worksheet templates...");

  const mathTemplate = await prisma.template.upsert({
    where: { id: "math-addition-basic" },
    update: {},
    create: {
      id: "math-addition-basic",
      name: "Basic Addition Practice",
      description: "Simple addition problems for early learners",
      subject: "Math",
      gradeLevel: "K-2",
      category: "Arithmetic",
      content: JSON.stringify({
        type: "math_worksheet",
        problems: 20,
        operation: "addition",
        maxNumber: 20,
      }),
      isPublic: true,
      isPremium: false,
    },
  });

  const scienceTemplate = await prisma.template.upsert({
    where: { id: "science-observation" },
    update: {},
    create: {
      id: "science-observation",
      name: "Science Observation Journal",
      description: "Track and record scientific observations",
      subject: "Science",
      gradeLevel: "3-5",
      category: "Scientific Method",
      content: JSON.stringify({
        type: "journal",
        sections: ["Hypothesis", "Observations", "Conclusions"],
      }),
      isPublic: true,
      isPremium: false,
    },
  });

  const readingTemplate = await prisma.template.upsert({
    where: { id: "reading-comprehension" },
    update: {},
    create: {
      id: "reading-comprehension",
      name: "Reading Comprehension Questions",
      description: "Comprehension questions for any reading passage",
      subject: "Language Arts",
      gradeLevel: "3-6",
      category: "Reading",
      content: JSON.stringify({
        type: "comprehension",
        questionTypes: ["main_idea", "detail", "inference", "vocabulary"],
        questionCount: 10,
      }),
      isPublic: true,
      isPremium: false,
    },
  });

  const premiumTemplate = await prisma.template.upsert({
    where: { id: "math-word-problems-advanced" },
    update: {},
    create: {
      id: "math-word-problems-advanced",
      name: "Advanced Word Problems",
      description: "Multi-step word problems with real-world applications",
      subject: "Math",
      gradeLevel: "6-8",
      category: "Problem Solving",
      content: JSON.stringify({
        type: "word_problems",
        difficulty: "advanced",
        steps: "multi",
        problemCount: 15,
      }),
      isPublic: true,
      isPremium: true,
    },
  });

  console.log("✅ Created templates:", {
    mathTemplate: mathTemplate.id,
    scienceTemplate: scienceTemplate.id,
    readingTemplate: readingTemplate.id,
    premiumTemplate: premiumTemplate.id,
  });

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
