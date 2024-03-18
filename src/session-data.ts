/**
 * @see EXT-X-SESSION-DATA (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.4)
 */
export interface SessionData {
    id: string;
    value?: string;
    uri?: string;
    language?: string;
}
