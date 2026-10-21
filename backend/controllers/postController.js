const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const User = require("../models/User");

// @desc    Get all posts with optional search and category filter
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  // Build filter
  const filter = {};
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const count = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .populate("author", "name")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    posts,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "name");
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  res.json(post);
});

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { title, content, coverImage, category } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Please add title and content");
  }

  const post = await Post.create({
    title,
    content,
    coverImage: coverImage || "",
    category: category || "",
    author: req.user.id,
  });

  const populatedPost = await Post.findById(post._id).populate(
    "author",
    "name"
  );

  res.status(201).json(populatedPost);
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (author only)
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Check ownership
  if (post.author.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to update this post");
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      content: req.body.content,
      coverImage: req.body.coverImage || "",
      category: req.body.category || "",
    },
    { new: true, runValidators: true }
  ).populate("author", "name");

  res.json(updatedPost);
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (author only)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.author.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to delete this post");
  }

  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post removed" });
});

// @desc    Get categories
// @route   GET /api/posts/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Post.distinct("category", {
    category: { $ne: "" },
  });
  res.json(categories);
});

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getCategories,
};
