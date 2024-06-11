const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.createEducationContent = async (req, res) => {
  const { title, description, content, imageUrl, source } = req.body;

  try {
    const newContent = await prisma.educationContent.create({
      data: {
        title,
        description,
        content,
        imageUrl,
        source,
      },
    });

    res.status(201).json(newContent);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating education content: " + error.message });
  }
};

exports.getAllEducationContents = async (req, res) => {
  try {
    const contents = await prisma.educationContent.findMany();
    res.status(200).json(contents);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving education contents: " + error.message });
  }
};

exports.getEducationContentById = async (req, res) => {
  const { id } = req.params;
  try {
    const content = await prisma.educationContent.findUnique({
      where: { id },
    });
    if (content) {
      res.status(200).json(content);
    } else {
      res.status(404).json({ error: "Education content not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving education content: " + error.message });
  }
};

exports.updateEducationContent = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, imageUrl, source } = req.body;

  try {
    const updatedContent = await prisma.educationContent.update({
      where: { id },
      data: {
        title,
        description,
        content,
        imageUrl,
        source,
      },
    });

    res.status(200).json(updatedContent);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Education content not found" });
    } else {
      res
        .status(500)
        .json({ error: "Error updating education content: " + error.message });
    }
  }
};

exports.deleteEducationContent = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.educationContent.delete({
      where: { id },
    });

    res.status(204).json({ message: "Education content deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Education content not found" });
    } else {
      res
        .status(500)
        .json({ error: "Error deleting education content: " + error.message });
    }
  }
};