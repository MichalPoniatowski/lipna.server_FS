const { Schema, model, default: mongoose } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const imageSchema = new Schema(
  {
    image_name: {
      type: String,
      required: [true],
    },
    mime_type: {
      type: String,
      required: [true],
    },
    image_dir: {
      type: String,
      required: [true],
    },
  },
  { strict: true, timestamps: true }
);

imageSchema.index({
  image_dir: 1,
  image_name: 1,
});

imageSchema.plugin(mongoosePaginate);

const Image = model("lipna.images", imageSchema);

module.exports = { Image };
