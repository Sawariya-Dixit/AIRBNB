const Listing = require('../models/listning');
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { uploadToCloudinary } = require("../cloudConfig.js");

// 🏠 INDEX route (with optional category + search filter)
module.exports.index = async (req, res) => {
  const { category, search } = req.query;
  let filter = {};

  // 🎯 Category filter
  if (category && category !== "all") {
    filter.category = category;
  }

  // 🔍 Search filter (matches title, location, or country)
  if (search && search.trim() !== "") {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [{ title: regex }, { location: regex }, { country: regex }];
  }

  const allListing = await Listing.find(filter);

  res.render("listings/index.ejs", {
    allListing,
    selectedCategory: category || "all",
    search: search || "",
  });
};


// ➕ NEW form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// 👁 SHOW route
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// 🧱 CREATE route
module.exports.createListing = async (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error)
    throw new ExpressError(400, error.details.map((e) => e.message).join(","));

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // 🖼 Upload image to Cloudinary if provided
  if (req.file && req.file.buffer) {
    const result = await uploadToCloudinary(req.file.buffer);
    newListing.image = {
      url: result.secure_url,
      filename: result.public_id,
    };
  } else {
    // 🧩 Default Unsplash fallback
    newListing.image = {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
      filename: "unsplash-default",
    };
  }

  await newListing.save();
  req.flash("success", "Listing Created!");
  res.redirect(`/listings/${newListing._id}`);
};

// ✏️ EDIT route
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  const imgUrl = listing.image?.url || "";
  let originalImageUrl = imgUrl;

  // 🔄 generate thumbnail preview
  if (imgUrl.includes("res.cloudinary.com")) {
    originalImageUrl = imgUrl.replace("/upload/", "/upload/h_250,w_300,c_fill,q_auto/");
  } else if (imgUrl.includes("images.unsplash.com")) {
    const cleanUrl = imgUrl.split("?")[0];
    originalImageUrl = `${cleanUrl}?auto=format&fit=crop&w=300&h=250&q=60`;
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// 🔧 UPDATE route
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this listing!");
    return res.redirect(`/listings/${id}`);
  }

  const updatedData = { ...req.body.listing };

  if (req.file && req.file.buffer) {
    const result = await uploadToCloudinary(req.file.buffer);
    updatedData.image = {
      url: result.secure_url,
      filename: result.public_id,
    };
  }

  await Listing.findByIdAndUpdate(id, updatedData);
  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
};

// 🗑 DELETE route
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};
