import { APIMessage } from '../../system/api/APIMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { AuthResponse } from '../../objects/AuthResponse';
export class Register extends APIMessage<AuthResponse> {
    readonly email: string;
    readonly name: string;
    readonly password: string;
    constructor(email: string, name: string, password: string) { super(); this.email = email; this.name = name; this.password = password; }
    send(signal?: AbortSignal): Promise<AuthResponse> { return sendAPI(this, signal); }
}
