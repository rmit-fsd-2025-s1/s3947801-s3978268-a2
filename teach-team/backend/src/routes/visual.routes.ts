import express from 'express';
import { VisualController } from '../controller/VisualController';

const router = express.Router();
const visualController = new VisualController();

router.get('/visualStats', visualController.getVisualStats.bind(visualController));

export default router;
