const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userLogger = require("../middleware/userLogger");

router.use(userLogger);

router.get("/technologies", userController.getAllTechnologies);
router.get("/freelancers", userController.getAllFreelancers);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserById);
router.post("/", userController.createUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
