import express from 'express';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { ctrlWrapper } from '../middlewares/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

const contactSchema = {
  name: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 3, max: 20 },
    },
    optional: { options: { nullable: true } },
  },
  phoneNumber: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 3, max: 20 },
    },
    optional: { options: { nullable: true } },
  },
  email: {
    in: ['body'],
    isEmail: true,
    optional: { options: { nullable: true } },
  },
  isFavourite: {
    in: ['body'],
    isBoolean: true,
    optional: { options: { nullable: true } },
  },
  contactType: {
    in: ['body'],
    isString: true,
    isIn: {
      options: [['work', 'home', 'personal']],
    },
    optional: { options: { nullable: true } },
  },
};

router.get('/', auth, ctrlWrapper(getContacts));
router.get('/:contactId', auth, isValidId, ctrlWrapper(getContact));
router.post('/', auth, validateBody(contactSchema), ctrlWrapper(createContact));
router.patch(
  '/:contactId',
  auth,
  isValidId,
  validateBody(contactSchema),
  ctrlWrapper(updateContact),
);
router.delete('/:contactId', auth, isValidId, ctrlWrapper(deleteContact));

export default router;
