import app from './app.js';
import { AppDataSource } from './config/data-source.js';
import { Config } from './config/index.js';
import logger from './config/logger.js';

const startServer = async () => {
    const { PORT } = Config;

    try {
        await AppDataSource.initialize();

        logger.info('Database connected successfully');

        app.listen(PORT, () => {
            logger.info('Server listening to PORT', { port: PORT });
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err);
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

void startServer();
