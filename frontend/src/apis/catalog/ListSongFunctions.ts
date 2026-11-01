import { APIMessage } from '../../system/api/APIMessage';
import { sendAPI } from '../../system/api/sendAPI';
import type { SongFunctionDefinition } from '../../objects/SongFunctionDefinition';
export class ListSongFunctions extends APIMessage<SongFunctionDefinition[]> {
    send(signal?: AbortSignal): Promise<SongFunctionDefinition[]> { return sendAPI(this, signal); }
}
