const { Schema, model, default: mongoose } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const contactFormSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      // match: [regex]
    },
    surname: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      // match: [regex]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      // match: [regex]
    },
    client_send: {
      type: Boolean,
      required: false,
      default: false,
    },
    lipna_send: {
      type: Boolean,
      required: false,
      default: false,
    },
    answer: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: String,
      enum: ["Do wyceny", "Klient zrezygnował", "Brak odpowiedzi od klienta"],
      required: false,
      default: null,
    },
    files: [
      {
        filename: {
          type: String,
          required: false,
          default: null,
        },
        file_path: {
          type: String,
          required: false,
          default: null,
        },
        file_size: {
          type: Number,
          required: false,
          default: null,
        },
        mime_type: {
          type: String,
          required: false,
          default: null,
        },
      },
    ],
    files_total_size: {
      type: Number,
      required: false,
      default: null,
    },
    files_dir: {
      type: String,
      required: false,
      default: null,
    },
  },
  { strict: true, timestamps: true }
);

contactFormSchema.index({
  _id: 1,
  email: 1,
  files: 1,
  files_total_size: 1,
  files_dir: 1,
});

contactFormSchema.plugin(mongoosePaginate);

const ContactForm = model("lipna.contact-forms", contactFormSchema);

module.exports = { ContactForm };
