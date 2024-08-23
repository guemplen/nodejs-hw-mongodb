import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';
import {
  getAllContacts,
  getContactById,
  addContact,
  updateExistingContact,
  deleteContactById,
} from '../services/contacts.js';
import createError from 'http-errors';

export const getContacts = async (req, res, next) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  const pageNum = parseInt(page);
  const perPageNum = parseInt(perPage);

  if (isNaN(pageNum) || isNaN(perPageNum) || pageNum <= 0 || perPageNum <= 0) {
    return next(createError(400, 'Invalid page or perPage parameter'));
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  try {
    const { data, totalItems } = await getAllContacts(
      req.user.userId,
      pageNum,
      perPageNum,
      sortOptions,
    );
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
    console.error('Error in getContacts:', error);
    next(error);
  }
};

export const getContact = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await getContactById(req.user.userId, contactId);
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
    console.error('Error in getContact:', error);
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  let photoUrl = '';
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      photoUrl = result.secure_url;
      await fs.unlink(req.file.path);
    } catch (error) {
      return next(createError(500, 'Failed to upload image to Cloudinary'));
    }
  }

  try {
    const newContact = await addContact({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
      userId: req.user.userId,
      photo: photoUrl,
    });
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    next(createError(500, 'Failed to create contact'));
  }
};

export const updateContact = async (req, res, next) => {
  const { contactId } = req.params;

  let photoUrl = '';
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      photoUrl = result.secure_url;
      await fs.unlink(req.file.path);
    } catch (error) {
      return next(createError(500, 'Failed to upload image to Cloudinary'));
    }
  }

  const updateData = { ...req.body };
  if (photoUrl) {
    updateData.photo = photoUrl;
  }

  try {
    const updatedContact = await updateExistingContact(
      req.user.userId,
      contactId,
      updateData,
    );
    if (!updatedContact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      status: 200,
      message: 'Successfully updated contact!',
      data: updatedContact,
    });
  } catch (error) {
    console.error('Error in updateContact:', error);
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const deletedContact = await deleteContactById(req.user.userId, contactId);
    if (!deletedContact) {
      throw createError(404, 'Contact not found');
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteContact:', error);
    next(error);
  }
};
