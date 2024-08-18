import { v4 } from 'uuid';
import { JsonError } from './Validator';

export function createRandomId() {
    return v4();
}

export function parseJSON(arg: string) {
    try {
        return JSON.parse(arg);
    } catch (error) {
        throw new JsonError((error as Error).message);
    }
}
