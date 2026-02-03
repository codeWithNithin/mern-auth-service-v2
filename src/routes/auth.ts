import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';

const router = Router();

const authController = new AuthController();

router.post('/register', (req, res, next) =>
    authController.register(req, res, next),
);

export default router;
