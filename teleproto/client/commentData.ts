import { Api } from "../tl";
import type { EntityLike } from "../define";
import { getInputPeer, getMessageId } from "../Utils";
import type { TelegramClient } from "./TelegramClient";

/** @hidden */
export async function getCommentData(
    client: TelegramClient,
    entity: EntityLike,
    message: number | Api.Message
) {
    const result = await client.invoke(
        new Api.messages.GetDiscussionMessage({
            peer: entity,
            msgId: getMessageId(message),
        })
    );
    const relevantMessage = result.messages.reduce(
        (p: Api.TypeMessage, c: Api.TypeMessage) => (p && p.id < c.id ? p : c)
    );
    let chat;
    for (const c of result.chats) {
        if (
            relevantMessage.peerId instanceof Api.PeerChannel &&
            c.id.eq(relevantMessage.peerId.channelId)
        ) {
            chat = c;
            break;
        }
    }
    return {
        entity: getInputPeer(chat),
        replyTo: relevantMessage.id,
    };
}
