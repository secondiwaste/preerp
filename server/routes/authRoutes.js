const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const i18n = require('../config/i18n');

const router = express.Router();

// Validation rules with i18n support
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage((value, { req }) => i18n.tReq(req, 'auth.validation.usernameLength')),
  body('password')
    .isLength({ min: 6 })
    .withMessage((value, { req }) => i18n.tReq(req, 'auth.validation.passwordLength'))
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage((value, { req }) => i18n.tReq(req, 'auth.validation.usernameRequired')),
  body('password')
    .notEmpty()
    .withMessage((value, { req }) => i18n.tReq(req, 'auth.validation.passwordRequired'))
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
