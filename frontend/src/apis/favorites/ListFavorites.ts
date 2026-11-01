import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage';
import { sendAPI } from '../../system/api/sendAPI';
export class ListFavorites extends APIWithTokenMessage<string[]> {
    constructor() { super(); }
    send(signal?: AbortSignal): Promise<string[]> { return sendAPI(this, signal); }
}
