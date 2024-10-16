import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import { error, success, type ErrorOr } from 'src/common/error';

export const configSchema = z
    .object({
        jwt_secret: z.string(),
        gameserver_executable: z.string(),
        simulator_library_path: z.string(),
        database_settings: z
            .object({
                initialize_lazy: z.boolean().optional().default(true),
            })
            .strict()
            .optional()
            .default({}),
    })
    .strict();

export type Config = z.infer<typeof configSchema>;

export async function readConfig(filePath: string): Promise<ErrorOr<Config>> {
    if (fs.existsSync(filePath)) {
        return error('File does not exist');
    }

    const data = await readFile(filePath);

    const result = await configSchema.safeParseAsync(data);

    if (!result.success) {
        return error(`Parse error: ${result.error}`);
    }

    return success(result.data);
}
