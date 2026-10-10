import "dotenv/config";
import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import Like from "../models/Like.model.js";
import Comment from "../models/Comment.model.js";
import Follow from "../models/Follow.model.js";
import mongoose from "mongoose";

// Optional demo content so the deployed app is not an empty shell while it is
// being evaluated. Safe to re-run: it replaces its own users and their posts.
// Delete this file (and the npm script) for a clean production database.
const PASSWORD = "Demo@123";

const USERS = [
  {
    username: "riya.codes",
    fullName: "Riya Kapoor",
    email: "riya.codes@instaclone.test",
    bio: "Frontend developer · coffee · camera",
    profilePicture:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    username: "arjun.wanders",
    fullName: "Arjun Mehta",
    email: "arjun.wanders@instaclone.test",
    bio: "Travel diary, one frame at a time",
    profilePicture:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    username: "meera.frames",
    fullName: "Meera Nair",
    email: "meera.frames@instaclone.test",
    bio: "Street photography · Mumbai",
    profilePicture:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

const photo = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

const POSTS = [
  {
    user: "riya.codes",
    media: [{ url: photo(415829), type: "image" }],
    caption: "Shipped the new dashboard today. Coffee helped.",
    hashtags: ["frontend", "webdev", "dashboard"],
    location: "Bengaluru, India",
  },
  {
    user: "arjun.wanders",
    media: [{ url: photo(1640777), type: "image" }],
    caption: "Valley morning, no filter needed.",
    hashtags: ["travel", "mountains", "sunrise"],
    location: "Kasol, Himachal",
  },
  {
    user: "meera.frames",
    media: [{ url: photo(1681010), type: "image" }],
    caption: "Local train, golden hour.",
    hashtags: ["streetphotography", "mumbai", "goldenhour"],
    location: "Churchgate",
  },
  {
    user: "riya.codes",
    media: [{ url: photo(3225517), type: "image" }],
    caption: "Desk setup refresh — finally fixed the cable mess.",
    hashtags: ["setup", "workspace"],
    location: "",
  },
  {
    user: "arjun.wanders",
    media: [{ url: photo(1239291), type: "image" }],
    caption: "Two days of trekking, one memory card full.",
    hashtags: ["trek", "himalayas"],
    location: "Hampta Pass",
  },
  {
    user: "meera.frames",
    media: [
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        type: "video",
        duration: 15,
      },
    ],
    caption: "Short clip from the evening walk — tap Reels to watch.",
    hashtags: ["reels", "video", "citylights"],
    location: "Mumbai",
  },
];

const COMMENTS = [
  { user: "meera.frames", text: "This looks great!" },
  { user: "arjun.wanders", text: "Colour grading is spot on." },
  { user: "riya.codes", text: "Saving this for the next trip." },
];

const seedDemo = async () => {
  try {
    await connectDB();
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin found — run `npm run seed:admin` first.");
      return;
    }

    const users = [];
    for (const spec of USERS) {
      users.push(
        await User.findOneAndUpdate(
          { email: spec.email },
          { $set: { ...spec, password: hashed, status: "active", isVerified: true } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        ),
      );
    }
    const byName = Object.fromEntries(users.map((u) => [u.username, u]));
    const demoIds = users.map((u) => u._id);

    await Post.deleteMany({ user: { $in: demoIds } });
    const posts = await Post.insertMany(
      POSTS.map((p) => ({
        ...p,
        user: byName[p.user]._id,
        status: "published",
        publishedAt: new Date(),
      })),
    );

    await Like.deleteMany({ post: { $in: posts.map((p) => p._id) } });
    await Comment.deleteMany({ post: { $in: posts.map((p) => p._id) } });
    await Follow.deleteMany({ $or: [{ follower: { $in: demoIds } }, { following: { $in: demoIds } }] });

    const likes = [];
    posts.forEach((post, i) => {
      users.forEach((user, j) => {
        if ((i + j) % 2 === 0 && String(user._id) !== String(post.user)) {
          likes.push({ post: post._id, user: user._id });
        }
      });
    });
    await Like.insertMany(likes);

    const comments = [];
    posts.forEach((post, i) => {
      const c = COMMENTS[i % COMMENTS.length];
      comments.push({ post: post._id, user: byName[c.user]._id, text: c.text });
    });
    await Comment.insertMany(comments);

    // Everyone follows the admin, and the demo accounts follow each other, so
    // follower counts and the notifications feed have something to show.
    const follows = [];
    const seen = new Set();
    const addFollow = (follower, following) => {
      const key = `${follower}_${following}`;
      if (String(follower) === String(following) || seen.has(key)) return;
      seen.add(key);
      follows.push({ follower, following });
    };
    for (const user of users) {
      addFollow(user._id, admin._id);
      addFollow(admin._id, user._id);
      for (const other of users) addFollow(user._id, other._id);
    }
    await Follow.insertMany(follows);

    console.log("--------------------------------");
    console.log(`✅ Demo content ready: ${users.length} users, ${posts.length} posts`);
    console.log(`   Demo login password for every account: ${PASSWORD}`);
    console.log("--------------------------------");
  } catch (error) {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDemo();
