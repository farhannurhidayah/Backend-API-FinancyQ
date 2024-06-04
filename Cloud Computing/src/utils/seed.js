const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const educationContents = [
    {
      title: "Saving money is saving your life",
      description: "Tips and tricks for saving money.",
      content: "This content appears when you hover over the image.",
      imageUrl: "https://example.com/image1.png",
      source: "Financial Times",
    },
    {
      title: "Tips dan trick menabung ala anak kos!",
      description: "Tips untuk menabung bagi anak kos.",
      content: "Content hover text.",
      imageUrl: "https://example.com/image2.png",
      source: "Financial Advisor",
    },
    // Add more entries as needed
  ];

  for (const content of educationContents) {
    await prisma.educationContent.create({
      data: content,
    });
  }

  console.log("Database has been seeded. 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
