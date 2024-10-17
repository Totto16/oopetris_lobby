// setup file for jest
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { ConfigModule } from '../config/config.module';

async function setup(globalConfig: unknown, projectConfig: unknown) {
    const envFile = path.join(__dirname, '.test.env');
    if (!fs.existsSync(envFile)) {
        throw new Error(`File not Found: ${envFile}`);
    }
    const result = dotenv.config({ path: envFile });
    if (result.error !== undefined) {
        throw result.error;
    }

    await ConfigModule.setup();
}

export default setup;
