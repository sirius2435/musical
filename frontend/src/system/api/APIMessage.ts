export abstract class APIMessage<T> {
    declare readonly responseType: T;
    get needsUserToken() { return false; }
    abstract send(signal?: AbortSignal): Promise<T>;
}
