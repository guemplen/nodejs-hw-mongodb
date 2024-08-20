import Contact from '../models/contact.js';

export const getAllContacts = async (userId, page, perPage, sortOptions) => {
  const skip = (page - 1) * perPage;
  const [data, totalItems] = await Promise.all([
    Contact.find({ userId }).sort(sortOptions).skip(skip).limit(perPage),
    Contact.countDocuments({ userId }),
  ]);

  return { data, totalItems };
};

export const getContactById = async (userId, contactId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

export const addContact = async (contactData) => {
  const contact = new Contact(contactData);
  return await contact.save();
};

export const updateExistingContact = async (userId, contactId, updateData) => {
  return await Contact.findOneAndUpdate({ _id: contactId, userId }, updateData, { new: true });
};

export const deleteContactById = async (userId, contactId) => {
  return await Contact.findOneAndDelete({ _id: contactId, userId });
};
