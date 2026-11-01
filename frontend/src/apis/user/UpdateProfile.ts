import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { UserProfile } from '../../objects/UserProfile';
export class UpdateProfile extends APIWithTokenMessage<UserProfile> {
    readonly name: string;
    constructor(name: string) { super(); this.name = name; }
    send(signal?: AbortSignal): Promise<UserProfile> { return sendAPI(this, signal); }
}
