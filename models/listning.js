const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,

 image: {
  url: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60",
  },
  filename: {
    type: String,
    default: "default_image",
  },
},


  price: { type: Number, required: true, default: 0 },
  location: String,
  country: String,

  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  owner: { type: Schema.Types.ObjectId, ref: "User" },

  // ✅ Extended categories for full icon set
  category: {
    type: String,
    enum: [
      "trending",      
      "rooms",          
      "iconic cities",  
      "mountain",       
      "castles",        
      "arctic",       
      "camping",        
      "farms",         
      "doms",           
      "boat",           
      "deserts"      
    ],
    default: "trending",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
