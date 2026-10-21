const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate("author", "name")
    .sort({ createdAt: -1 });
  res.json(comments);
});

// @desc    Add a comment
// @route   POST /api/posts/:postId/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    res.status(400);
    throw new Error("Please add comment text");
  }

  const post = await Post.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = await Comment.create({
    text: text.trim(),
    post: req.params.postId,
    author: req.user.id,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "name"
  );

  res.status(201).json(populatedComment);
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (author only)
const updateComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    res.status(400);
    throw new Error("Please add comment text");
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (comment.author.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to update this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    { text: text.trim() },
    { new: true, runValidators: true }
  ).populate("author", "name");

  res.json(updatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author only)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (comment.author.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: "Comment removed" });
});

module.exports = {
  getComments,
  addComment,
  updateComment,
  deleteComment,
};
