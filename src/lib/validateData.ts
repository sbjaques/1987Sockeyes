import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import rosterSchema from '../data/schema/roster.schema.json';
import gamesSchema  from '../data/schema/games.schema.json';
import mediaSchema  from '../data/schema/media.schema.json';

const ajv = addFormats(new Ajv({ allErrors: true }));

export const validateRoster = ajv.compile(rosterSchema);
export const validateGames  = ajv.compile(gamesSchema);
export const validateMedia  = ajv.compile(mediaSchema);

export function assertValid<T>(validator: (d: unknown) => boolean, data: unknown, name: string): T {
  if (!validator(data)) {
    const errs = (validator as unknown as { errors: unknown }).errors;
    throw new Error(`Invalid ${name}: ${JSON.stringify(errs, null, 2)}`);
  }
  return data as T;
}
