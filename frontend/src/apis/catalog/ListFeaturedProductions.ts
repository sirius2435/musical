import { APIMessage } from '../../system/api/APIMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { Entry } from '../../objects/Entry';
export class ListFeaturedProductions extends APIMessage<Entry[]> {
    send(signal?: AbortSignal): Promise<Entry[]> { return sendAPI(this, signal); }
}
