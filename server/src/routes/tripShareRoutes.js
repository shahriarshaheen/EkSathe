import { Router } from 'express';
import {
  createTripShare,
  updateTripShare,
  stopTripShare,
  getTripShare,
} from '../controllers/tripShareController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

// Public — no auth
router.get('/:token', getTripShare);

// Authenticated
router.post('/', authenticate, createTripShare);
router.patch('/:token', authenticate, updateTripShare);
router.delete('/:token', authenticate, stopTripShare);

export default router;