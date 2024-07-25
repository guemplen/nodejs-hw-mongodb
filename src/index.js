import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

async function startServer() {
  await initMongoConnection();
  setupServer();
}

startServer();
