import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { UserProfile } from '../../objects/UserProfile';
export class CurrentUser extends APIWithTokenMessage<UserProfile> {
    constructor() { super(); }
    send(signal?: AbortSignal): Promise<UserProfile> { return sendAPI(this, signal); }
}
