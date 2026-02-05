import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import UserService from '../services/UserService.js';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entity/User.js';
import logger from '../config/logger.js';

const router = Router();

const userRepo = AppDataSource.getRepository(User);
const userService = new UserService(userRepo);
const authController = new AuthController(userService, logger);

/**
 * @path POST /auth/register
 * @returns 201 with user id
 * @access public
 */
router.post('/register', (req, res, next) =>
    authController.register(req, res, next),
);

export default router;
