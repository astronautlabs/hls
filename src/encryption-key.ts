/**
 * @see EXT-X-KEY (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4)
 */
export type EncryptionKey = NoEncryptionKey | AES128EncryptionKey;

export interface NoEncryptionKey {
    method: 'NONE';
}

export interface AES128EncryptionKey {
    method: 'AES-128' | 'SAMPLE-AES';
    uri: string;
    keyFormat?: 'identity';
    keyFormatVersions?: number[];

    /**
     * [AES_128] REQUIRES the same 16-octet IV to be supplied when
     * encrypting and decrypting.  Varying this IV increases the strength of
     * the cipher.
     *
     * An IV attribute on an EXT-X-KEY tag with a KEYFORMAT of "identity"
     * specifies an IV that can be used when decrypting Media Segments
     * encrypted with that Key file.  IV values for AES-128 are 128-bit
     * numbers.
     *
     * An EXT-X-KEY tag with a KEYFORMAT of "identity" that does not have an
     * IV attribute indicates that the Media Sequence Number is to be used
     * as the IV when decrypting a Media Segment, by putting its big-endian
     * binary representation into a 16-octet (128-bit) buffer and padding
     * (on the left) with zeros.
     */
    iv?: Uint8Array;
}
