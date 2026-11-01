import { APIWithTokenMessage } from '../../system/api/APIWithTokenMessage';
import { sendAPI } from '../../system/api/sendAPI';
export class UpdateProductionRelations extends APIWithTokenMessage<boolean> {
    readonly productionId: string;
    readonly creatorIds: string[];
    readonly songIds: string[];
    constructor(productionId: string, creatorIds: string[], songIds: string[]) { super(); this.productionId = productionId; this.creatorIds = creatorIds; this.songIds = songIds; }
    send(signal?: AbortSignal): Promise<boolean> { return sendAPI(this, signal); }
}
