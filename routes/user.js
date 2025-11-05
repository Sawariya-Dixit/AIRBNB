const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/WrapAsync.js"); // ✅ added this
const ExpressError = require("../utils/ExpressError.js");
const passport = require('passport');
const { saveRedirectUrl } = require("../middelware.js");

const userController = require('../controllers/users.js');

//* render sign up form 
router.get("/signup" ,userController.renderSignUpForm );

//* post sign up form
router.post("/signup", wrapAsync(userController.signup));

//* login render form
router.get("/login", userController.renderLoginForm );

//*
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(userController.login)
);


router.get('/logout', userController.logOut);

module.exports = router;
