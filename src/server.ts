import app from './app.js';
import { Config } from './config/index.js';
import logger from './config/logger.js';

const startServer = () => {
    const { PORT } = Config;

    try {
        app.listen(PORT, () => {
            logger.info('Server listening to PORT', { port: PORT });
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

void startServer();
