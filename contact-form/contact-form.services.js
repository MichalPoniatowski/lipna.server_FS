const { ContactForm } = require("./contact-form.model");

const listContactForms = async (options) => {
  try {
    const { page, limit, name, email } = options;

    const paginationOptions = {
      limit: limit || 10,
      page: page || 1,
      sort: { createdAt: -1 },
    };

    const queryFilters = {};
    if (email) {
      queryFilters.email = { $regex: new RegExp(email, "i") };
    }
    if (name) {
      queryFilters.name = { $regex: new RegExp(name, "i") };
    }

    const forms = await ContactForm.paginate(queryFilters, paginationOptions);
    return forms;
  } catch (error) {
    console.error("Could not get contact-forms from database " + error.message);
    return [];
  }
};

const getContactFormById = async (formId) => {
  try {
    const form = await ContactForm.findOne({ _id: formId });
    return form;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const addContactForm = async (form) => {
  try {
    const newForm = new ContactForm(form);
    const savedForm = await newForm.save();
    return savedForm;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const deleteContactForm = async (formId) => {
  try {
    const form = await ContactForm.findOneAndDelete({ _id: formId });
    return form;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const updateContactForm = async (formId, updateForm) => {
  try {
    const updatedForm = await ContactForm.findByIdAndUpdate(
      { _id: formId },
      updateForm,
      { new: true }
    );
    return updatedForm;
  } catch (error) {
    console.error(error.message);
    throw Error;
  }
};

module.exports = {
  listContactForms,
  getContactFormById,
  addContactForm,
  deleteContactForm,
  updateContactForm,
};
