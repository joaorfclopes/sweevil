import { writeFileSync } from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  writeFileSync('/tmp/jest-mongo-config.json', JSON.stringify({ uri }));
  global.__MONGOSERVER__ = mongoServer;
}
