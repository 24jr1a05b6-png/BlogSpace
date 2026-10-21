const express = require("express");
const router = express.Router();
const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

router
  .route("/:postId/comments")
  .get(getComments)
  .post(protect, addComment);
router
  .route("/comments/:id")
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
