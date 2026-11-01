import { APIMessage } from '../../system/api/APIMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { Entry } from '../../objects/Entry';
export class ListEras extends APIMessage<Entry[]> {
    readonly keyword: string;
    readonly category: string;
    readonly sort: string;
    constructor(keyword: string = '', category: string = '', sort: string = 'chronological') { super(); this.keyword = keyword; this.category = category; this.sort = sort; }
    send(signal?: AbortSignal): Promise<Entry[]> { return sendAPI(this, signal); }
}
