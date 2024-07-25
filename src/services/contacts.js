import Contact from '../models/contact.js';

export const getAllContacts = async () => {
  return await Contact.find({});
};

export const getContactById = async (contactId) => {
  return Contact.findById(contactId);
};
