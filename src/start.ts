/**
 * @see EXT-X-START (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.5.2)
 */
export interface Start {
    timeOffset: number;
    precise: boolean;
}
