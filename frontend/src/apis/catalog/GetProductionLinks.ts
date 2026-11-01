import { APIMessage } from '../../system/api/APIMessage';
import { sendAPI } from '../../system/api/sendAPI';
export class GetProductionLinks extends APIMessage<{
    creatorIds: string[];
    songIds: string[];
}> {
    readonly id: string;
    constructor(id: string) { super(); this.id = id; }
    send(signal?: AbortSignal): Promise<{
        creatorIds: string[];
        songIds: string[];
    }> { return sendAPI(this, signal); }
}
