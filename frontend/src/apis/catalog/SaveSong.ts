import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { Entry } from '../../objects/Entry';
export class SaveSong extends APIWithTokenMessage<Entry> {
    readonly entry: Entry;
    constructor(entry: Entry) { super(); this.entry = entry; }
    send(signal?: AbortSignal): Promise<Entry> { return sendAPI(this, signal); }
}
