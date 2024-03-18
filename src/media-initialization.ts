import { ByteRange } from "./byte-range";

/**
 * @see EXT-X-MAP (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.5)
 */
export interface MediaInitialization {
    uri: string;
    byteRange?: ByteRange;
}
