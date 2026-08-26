import express from 'express';
import {admin, verifyJwt} from "../middleware/auth.middleware.js";
import { getAllEvents, getOneEvent, createEvent, getMyEvents, updateEvent, deleteEvent } from '../controller/events.controller.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/my-events', verifyJwt, admin, getMyEvents);
router.get('/:id', getOneEvent);
router.post('/create-event', verifyJwt, admin, createEvent);
router.put('/:id', verifyJwt, admin, updateEvent);
router.delete('/:id', verifyJwt, admin, deleteEvent);

export default router;
