import 'reflect-metadata'
import { DataSource } from 'typeorm';
import { User } from './models/User.js';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'projector.db',
  entities: [User],
  synchronize: true
})

export async function initDatabase() {
  await AppDataSource.initialize()
  console.log('Initialized database');
}