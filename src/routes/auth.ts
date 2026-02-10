import {
    Router,
    type NextFunction,
    type Response,
    type Request,
} from 'express';
import AuthController from '../controllers/AuthController.js';
import UserService from '../services/UserService.js';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entity/User.js';
import logger from '../config/logger.js';
import registerValidator from '../validators/registerValidator.js';
import { RefreshToken } from '../entity/RefreshToken.js';
import { TokenService } from '../services/TokenService.js';

const router = Router();

const userRepo = AppDataSource.getRepository(User);
const responseTokenRepo = AppDataSource.getRepository(RefreshToken);

const userService = new UserService(userRepo);
const tokenServie = new TokenService(responseTokenRepo);
const authController = new AuthController(
    userService,
    logger,
    responseTokenRepo,
    tokenServie,
);

/**
 * @path POST /auth/register
 * @returns 201 with user id
 * @access public
 */
router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
