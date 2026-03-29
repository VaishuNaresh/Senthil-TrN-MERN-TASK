const express = require("express");
const router = express.Router();

const {
    createUser,
    getAllUsers,
    getSingleUser,
     updateUser,
    deleteUser,
} = require("../controllers/userController");
const { body } = require("express-validator");

router.post("/userCustomer",[
    body("firstName").notEmpty().withMessage("First name is required"),
    body("email").isEmail().withMessage("Invalid email format").notEmpty().withMessage("Email is required"),
    body("password").isLength({ min: 6 }).notEmpty().withMessage("Password is required").withMessage("Password must be at least 6 characters long"),
    body("secretQuestion1").notEmpty().withMessage("Secret question 1 is required"),
    body("secretAnswer").notEmpty().withMessage("Secret answer is required"),
    body("secretQuestion2").notEmpty().withMessage("Secret question 2 is required"),
    body("secretAnswer2").notEmpty().withMessage("Secret answer 2 is required"),
    body("secretQuestion3").notEmpty().withMessage("Secret question 3 is required"),
    body("secretAnswer3").notEmpty().withMessage("Secret answer 3 is required"),
], createUser);
router.get("/userCustomer", getAllUsers);
// router.get("/userCustomer/:id", getSingleUser);
// 
router.put("/userCustomer/:id", updateUser);
 router.delete("/userCustomer/:id", deleteUser);

module.exports = router;