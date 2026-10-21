const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, "Category cannot be more than 50 characters"],
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search and sorting
postSchema.index({ title: "text", content: "text" });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });

module.exports = mongoose.model("Post", postSchema);
