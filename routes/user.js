import express from "express";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pictures", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// Upload profile picture to Cloudinary
router.post(
  "/upload-profile-picture",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Cloudinary URL
      const imageUrl = req.file.path;

      // Update user profile with new image URL
      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: { profilePic: imageUrl },
      });

      res.json({ message: "Profile picture updated", profilePicUrl: imageUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  }
);

// Get Profile with Profile Picture
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        email,
        name,
        bio,
        techStack,
        github,
        twitter,
        profilePic,
        createdAt,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: "9b2065d5-08bd-46c1-9f63-df9bd3c074b3" },
      select: {
        email: true,
        bio: true,
        techStack: true,
        github: true,
        twitter: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, bio, techStack, github, twitter } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, bio, techStack, github, twitter },
    });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
