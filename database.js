/**
 * MediSlot Database Interface (MongoDB Atlas Cloud Cluster)
 * Proxies to backend/src/config/db for unified MongoDB data persistence
 */

const backendDb = require('./backend/src/config/db');

module.exports = {
    initDatabase: backendDb.initDatabase,
    run: backendDb.run,
    get: backendDb.get,
    all: backendDb.all,
    withTransaction: backendDb.withTransaction,
    connectMongo: backendDb.connectMongo,
    closeDatabase: backendDb.closeDatabase,
    getDb: backendDb.getDb,
    models: backendDb.models
};
