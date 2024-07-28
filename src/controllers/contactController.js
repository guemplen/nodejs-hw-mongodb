import {
  getAllContacts,
  getContactById,
  addContact,
  updateExistingContact,
  deleteContactById,
} from '../services/contacts.js';
import createError from 'http-errors';

export const getContacts = async (req, res, next) => {
  const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

  const pageNum = parseInt(page);
  const perPageNum = parseInt(perPage);

  if (isNaN(pageNum) || isNaN(perPageNum) || pageNum <= 0 || perPageNum <= 0) {
    return next(createError(400, 'Invalid page or perPage parameter'));
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  try {
    const { data, totalItems } = await getAllContacts(pageNum, perPageNum);
    const totalPages = Math.ceil(totalItems / perPageNum);
    const hasPreviousPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data,
        page: pageNum,
        perPage: perPageNum,
        totalItems,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getContact = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await getContactById(contactId);
    if (!contact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  try {
    const newContact = await addContact({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
    });
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const updatedContact = await updateExistingContact(contactId, req.body);
    if (!updatedContact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const deletedContact = await deleteContactById(contactId);
    if (!deletedContact) {
      throw createError(404, 'Contact not found');
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
