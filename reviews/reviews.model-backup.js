const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const reviewsSchema = new Schema({}, { strict: false, timestamps: true });

reviewsSchema.index({ source_id: 1 });

reviewsSchema.plugin(mongoosePaginate);

const ReviewsBackup = model("lipna.reviews-backup", reviewsSchema);

module.exports = { ReviewsBackup };
