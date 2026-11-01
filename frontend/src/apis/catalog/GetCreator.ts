import { APIMessage } from '../../system/api/APIMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { Entry } from '../../objects/Entry';
export class GetCreator extends APIMessage<Entry> {
    readonly slug: string;
    constructor(slug: string) { super(); this.slug = slug; }
    send(signal?: AbortSignal): Promise<Entry> { return sendAPI(this, signal); }
}
