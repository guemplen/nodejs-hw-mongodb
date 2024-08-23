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
import { authenticate } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

const contactSchema = {};

router.use(authenticate);

router.get('/', ctrlWrapper(getContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContact));
router.post(
  '/',
  upload.single('photo'),
  validateBody(contactSchema),
  ctrlWrapper(createContact),
);
router.patch(
  '/:contactId',
  isValidId,
  upload.single('photo'),
  validateBody(contactSchema),
  ctrlWrapper(updateContact),
);
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
