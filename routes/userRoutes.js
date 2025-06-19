import express from "express";
import * as userController from "../controllers/userController.js";
import userLogger from "../middleware/userLogger.js";

const router = express.Router();

router.use(userLogger);

router.get("/technologies", userController.getAllTechnologies);
router.get("/freelancers", userController.getAllFreelancers);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserById);
router.post("/", userController.createUser);
router.delete("/:id", userController.deleteUser);

export default router;
