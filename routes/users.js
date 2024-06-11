const express = require("express");
const router = express.Router();
const {
  login,
  register,
  current,
  edit,
  getUserById,
} = require("../controllers/users");
const { auth } = require("../middleware/auth");

router.post("/login", login);

router.post("/register", register);

router.get("/current", auth, current);

router.get("/:id", auth, getUserById);

router.put("/edit/:id", auth, edit);

module.exports = router;
