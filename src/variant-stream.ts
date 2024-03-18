import { Media } from './media';

/**
 * A Variant Stream includes a Media Playlist that specifies media encoded at a particular bit rate, in a particular 
 * format, and at a particular resolution for media containing video.
 * 
 * @see Overview (https://datatracker.ietf.org/doc/html/rfc8216#section-2)
 */
export interface VariantStream {
    bandwidth: number;
    averageBandwidth?: number;
    codecs: string[] | undefined;
    resolution?: string;
    frameRate?: number;
    hdcpLevel?: 'NONE' | 'TYPE-0';
    audioGroup?: string;
    videoGroup?: string;
    subtitlesGroup?: string;
    closedCaptionsGroup?: string;
    uri: string;
}
