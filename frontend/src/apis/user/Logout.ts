import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage';
import { sendAPI } from '../../system/api/sendAPI';
export class Logout extends APIWithTokenMessage<boolean> {
    constructor() { super(); }
    send(signal?: AbortSignal): Promise<boolean> { return sendAPI(this, signal); }
}
