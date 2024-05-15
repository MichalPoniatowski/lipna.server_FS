const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const reviewsSchema = new Schema({}, { strict: false, timestamps: true });

reviewsSchema.index({ source_id: 1, rating: 1 });

reviewsSchema.plugin(mongoosePaginate);

const Reviews = model("lipna.reviews", reviewsSchema);

module.exports = {
  Reviews,
};
