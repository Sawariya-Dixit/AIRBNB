
const Listing = require("../models/listning.js");
const Review = require("../models/review.js");


//* create review 
module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);

    let { comment, rating } = req.body.review;

    // Clamp rating between 1 and 5
    rating = Math.max(1, Math.min(5, rating));

    let newReview = new Review({ comment, rating });
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "Created new review successfully!");
    res.redirect(`/listings/${listing._id}`);
  }

  //* Delete reviews

  module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted review successfully!");
    res.redirect(`/listings/${id}`);
  }