import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage';
import { sendAPI } from '../../system/api/sendAPI';
export class SetFavorite extends APIWithTokenMessage<boolean> {
    readonly productionId: string;
    readonly saved: boolean;
    constructor(productionId: string, saved: boolean) { super(); this.productionId = productionId; this.saved = saved; }
    send(signal?: AbortSignal): Promise<boolean> { return sendAPI(this, signal); }
}
