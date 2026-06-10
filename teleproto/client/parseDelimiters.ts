import { Api } from "../tl";

export type messageEntities =
    | typeof Api.MessageEntityBold
    | typeof Api.MessageEntityItalic
    | typeof Api.MessageEntityStrike
    | typeof Api.MessageEntityCode
    | typeof Api.MessageEntityPre;

export const DEFAULT_DELIMITERS: {
    [key: string]: messageEntities;
} = {
    "**": Api.MessageEntityBold,
    __: Api.MessageEntityItalic,
    "~~": Api.MessageEntityStrike,
    "`": Api.MessageEntityCode,
    "```": Api.MessageEntityPre,
};
