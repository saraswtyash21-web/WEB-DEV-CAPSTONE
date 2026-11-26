import { Router } from 'express';
import { createBook, deleteBook, getBook, getBookStats, listBooks, updateBook } from '../controllers/bookController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', listBooks);
router.get('/stats', getBookStats);
router.get('/:id', getBook);
router.post('/', requireAuth, allowRoles('librarian', 'admin'), createBook);
router.patch('/:id', requireAuth, allowRoles('librarian', 'admin'), updateBook);
router.delete('/:id', requireAuth, allowRoles('librarian', 'admin'), deleteBook);
export default router;
