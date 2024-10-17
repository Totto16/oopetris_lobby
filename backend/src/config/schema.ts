import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { error, success, type ErrorOr } from 'src/common/error';

export const configSchema = z
    .object({
        jwt_secret: z.string(),
        gameserver_executable: z.string(),
        simulator_library_path: z.string(),
    })
    .strict();

export type Config = z.infer<typeof configSchema>;

// from: https://github.com/colinhacks/zod/discussions/2215#discussioncomment-5356286
const stringToJSONSchema = z
    .string()
    .transform((str, ctx): z.infer<ReturnType<any>> => {
        try {
            return JSON.parse(str);
        } catch (e) {
            ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
            return z.NEVER;
        }
    });

export async function readConfig(filePath: string): Promise<ErrorOr<Config>> {
    if (!fs.existsSync(filePath)) {
        return error(`File does not exist`);
    }

    const data = (await readFile(filePath)).toString();

    const json = await stringToJSONSchema.safeParseAsync(data);
    if (!json.success) {
        return error(`Parse error: ${json.error}`);
    }

    const result = await configSchema.safeParseAsync(json.data);

    if (!result.success) {
        return error(`Parse error: ${result.error}`);
    }

    return success(result.data);
}
