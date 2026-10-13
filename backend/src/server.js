const app = require('./app');
const { PORT } = require('./config/env');
const { initDatabase } = require('./config/db');

async function startServer() {
    try {
        console.log('[Medislot API] Initializing database and security layers...');
        await initDatabase();

        app.listen(PORT, () => {
            console.log('========================================================');
            console.log(` Medislot Healthcare Backend API v2.0`);
            console.log(` Running on: http://localhost:${PORT}`);
            console.log(` Health check: http://localhost:${PORT}/api/health`);
            console.log(` API version: http://localhost:${PORT}/api/v1/`);
            console.log('========================================================');
        });
    } catch (err) {
        console.error('[Medislot API] Fatal server startup error:', err);
        process.exit(1);
    }
}

startServer();
