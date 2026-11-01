import { APIMessage } from '../../system/api/APIMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { AuthResponse } from '../../objects/AuthResponse';
export class Login extends APIMessage<AuthResponse> {
    readonly email: string;
    readonly password: string;
    constructor(email: string, password: string) { super(); this.email = email; this.password = password; }
    send(signal?: AbortSignal): Promise<AuthResponse> { return sendAPI(this, signal); }
}
