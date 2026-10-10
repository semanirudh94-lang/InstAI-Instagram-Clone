import Post from "../models/Post.model.js";
import Like from "../models/Like.model.js";
import Comment from "../models/Comment.model.js";
import Follow from "../models/Follow.model.js";

const USER_FIELDS = "username fullName profilePicture";

// Activity feed for /notifications: people who followed you, liked your posts
// or commented on them. Everything is derived from data the app already stores,
// so there is no separate notification document to keep in sync.
export const getActivity = async (req, res) => {
  try {
    const me = req.user._id;
    const posts = await Post.find({ user: me }).select("_id").lean();
    const myPostIds = posts.map((p) => p._id);

    const [follows, likes, comments] = await Promise.all([
      Follow.find({ following: me, follower: { $ne: me } })
        .populate("follower", USER_FIELDS)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      myPostIds.length
        ? Like.find({ post: { $in: myPostIds }, user: { $ne: me } })
            .populate("user", USER_FIELDS)
            .populate("post", "media")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()
        : [],
      myPostIds.length
        ? Comment.find({
            post: { $in: myPostIds },
            user: { $ne: me },
            isDeleted: false,
          })
            .populate("user", USER_FIELDS)
            .populate("post", "media")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()
        : [],
    ]);

    const items = [
      ...follows.map((f) => ({
        _id: `follow_${f._id}`,
        type: "follow",
        user: f.follower,
        createdAt: f.createdAt,
      })),
      ...likes.map((l) => ({
        _id: `like_${l._id}`,
        type: "like",
        user: l.user,
        post: l.post,
        createdAt: l.createdAt,
      })),
      ...comments.map((c) => ({
        _id: `comment_${c._id}`,
        type: "comment",
        user: c.user,
        post: c.post,
        text: c.text,
        createdAt: c.createdAt,
      })),
    ]
      .filter((item) => item.user && item.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 60);

    return res.status(200).json({ success: true, items });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
