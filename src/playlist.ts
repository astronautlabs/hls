import { AES128EncryptionKey } from "./encryption-key";
import { Media } from "./media";
import { MediaSegment } from "./media-segment";
import { SessionData } from "./session-data";
import { Start } from "./start";
import { VariantStream } from "./variant-stream";

/**
 * Represents an HLS Playlist (either a Master playlist or a Media playlist).
 * @see https://datatracker.ietf.org/doc/html/rfc8216#section-4.1
 */
export type Playlist = MasterPlaylist | MediaPlaylist;

export interface PlaylistCommon {
    version: number;
    independentSegments: boolean;
    start: Start | undefined;
}

/**
 * A Playlist is a Master Playlist if all URI lines in the Playlist identify Media Playlists.
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc8216#section-4.1
 */
export interface MasterPlaylist extends PlaylistCommon {
    kind: 'master';
    media: Media[];
    streams: VariantStream[];
    iframeStreamUri?: string;
    sessionData?: SessionData[];
    sessionKeys?: AES128EncryptionKey[];
}

/**
 * A Playlist is a Media Playlist if all URI lines in the Playlist identify Media Segments.
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc8216#section-4.1
 */
export interface MediaPlaylist extends PlaylistCommon {
    kind: 'media';
    version: number;
    targetDuration: number;
    mediaSequence: number;
    discontinuitySequence: number;
    ended: boolean;
    type: 'EVENT' | 'VOD' | undefined;
    iframesOnly: boolean;
    segments: MediaSegment[];
}
