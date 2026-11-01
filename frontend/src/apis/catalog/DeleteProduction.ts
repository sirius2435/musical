import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage';
import { sendAPI } from '../../system/api/sendAPI';
export class DeleteProduction extends APIWithTokenMessage<boolean> {
    readonly id: string;
    constructor(id: string) { super(); this.id = id; }
    send(signal?: AbortSignal): Promise<boolean> { return sendAPI(this, signal); }
}
