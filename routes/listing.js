const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middelware.js");
const listingController = require("../controllers/listings.js");
const { upload } = require("../cloudConfig.js"); // multer config only

// * Index Route
router.get("/", wrapAsync(listingController.index));

// * New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// * Show Route
router.get("/:id", wrapAsync(listingController.showListing));

// * Create Route
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing)
);

// * Edit Route
router.get("/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

// * Update Route
router.put("/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

// * Delete Route
router.delete("/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.deleteListing)
);

module.exports = router;
