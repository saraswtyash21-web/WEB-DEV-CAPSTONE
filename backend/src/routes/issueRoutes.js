import { Router } from 'express';
import { createIssue, getReports, listIssues, returnBook } from '../controllers/issueController.js';
import { listStudents } from '../controllers/userController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', listIssues);
router.get('/students', allowRoles('librarian', 'admin'), listStudents);
router.post('/', createIssue);
router.post('/:id/return', returnBook);
router.get('/reports/summary', allowRoles('librarian', 'admin'), getReports);
export default router;
