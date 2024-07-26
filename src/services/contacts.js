import Contact from '../models/contact.js';

export const getAllContacts = async () => {
  return await Contact.find({});
};

export const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

export const addContact = async (contactData) => {
  const contact = new Contact(contactData);
  return await contact.save();
};

export const updateExistingContact = async (contactId, updateData) => {
  return await Contact.findByIdAndUpdate(contactId, updateData, { new: true });
};

export const deleteContactById = async (contactId) => {
  return await Contact.findByIdAndDelete(contactId);
};
