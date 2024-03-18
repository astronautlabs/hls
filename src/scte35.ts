/**
 * @see Mapping SCTE-35 into EXT-X-DATERANGE (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7.1)
 */
export interface SCTE35 {
    command?: string;
    out?: string;
    in?: string;
}
