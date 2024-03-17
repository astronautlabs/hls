
/**
 * @see EXT-X-MEDIA (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.1)
 */
export type Media = ClosedCaptions | AlternativeMedia;
interface MediaCommon {
    groupId: string;
    language?: string;
    associatedLanguage?: string;
    name: string;
    default?: boolean;
    autoselect?: boolean;
    characteristics?: string[];
}

export interface ClosedCaptions extends MediaCommon {
    type: 'CLOSED-CAPTIONS';
    inStreamId: 'CC1' | 'CC2' | 'CC3' | 'CC4' | `SERVICE${number}`;
}

export interface AlternativeMedia extends MediaCommon {
    type: 'AUDIO' | 'VIDEO' | 'SUBTITLES' | 'CLOSED-CAPTIONS';
    uri: string;
}
