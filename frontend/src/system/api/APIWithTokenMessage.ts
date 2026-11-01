import { APIMessage } from './APIMessage';
export abstract class APIWithTokenMessage<T> extends APIMessage<T> {
    override get needsUserToken() { return true; }
}
