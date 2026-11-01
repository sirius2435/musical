import { APIMessage } from '../../system/api/APIMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { Entry } from '../../objects/Entry';
export class GetSongProductions extends APIMessage<Entry[]> {
    readonly id: string;
    constructor(id: string) { super(); this.id = id; }
    send(signal?: AbortSignal): Promise<Entry[]> { return sendAPI(this, signal); }
}
