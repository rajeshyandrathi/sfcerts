
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  // Read the Salesforce exams catalog
  const catalogPath = path.join(process.cwd(), '../../salesforce_exams_catalog.json');
  const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  console.log('Seeding database with Salesforce exam products...');

  // Clear existing products
  await prisma.product.deleteMany();

  // Create products from catalog
  for (const exam of catalogData) {
    await prisma.product.create({
      data: {
        examName: exam.examName,
        examCode: exam.examCode,
        description: exam.description,
        targetAudience: exam.targetAudience,
        difficultyLevel: exam.difficultyLevel,
        questionsCount: exam.questionsCount,
        examDuration: exam.examDuration,
        passingScore: exam.passingScore,
        keyTopics: exam.keyTopics,
        price: exam.price,
        sampleQuestions: exam.sampleQuestionFormats,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${catalogData.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
