const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getCategories,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getPosts).post(protect, createPost);
router.route("/categories").get(getCategories);
router
  .route("/:id")
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
