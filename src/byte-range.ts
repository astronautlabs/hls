
/**
 * @see EXT-X-BYTERANGE (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2)
 */
export interface ByteRange {
    length: number;
    offset?: number;
}
