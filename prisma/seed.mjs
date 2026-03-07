import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = "demo@example.com";
  const passwordHash = await bcrypt.hash("demo12345", 12);

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      displayName: "Demo User"
    }
  });

  const basicsTag = await db.tag.upsert({
    where: { userId_name: { userId: user.id, name: "basics" } },
    update: {},
    create: {
      userId: user.id,
      name: "basics",
      color: "#22c55e"
    }
  });

  const item = await db.learningItem.create({
    data: {
      userId: user.id,
      type: "word",
      finnishText: "kiitos",
      baseTranslation: "thank you",
      explanation: "A common way to express thanks",
      difficulty: 1,
      itemTags: {
        create: {
          tagId: basicsTag.id
        }
      },
      examples: {
        create: [
          {
            finnishSentence: "Kiitos avusta!",
            englishTranslation: "Thanks for the help!",
            position: 0
          }
        ]
      },
      reviewCards: {
        create: [
          {
            cardType: "recognition",
            prompt: "What does this mean: kiitos?",
            answer: "thank you"
          },
          {
            cardType: "recall",
            prompt: "What is the Finnish for: thank you?",
            answer: "kiitos"
          }
        ]
      }
    },
    select: { id: true }
  });

  console.info(`Seed complete. Demo user: ${email} / demo12345. Item id: ${item.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
