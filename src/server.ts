import app from './app.js';
import { Config } from './config/index.js';

const startServer = () => {
    const { PORT } = Config;

    try {
        app.listen(PORT, () => {
            console.log(`Server running at ${PORT}`);
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

void startServer();
