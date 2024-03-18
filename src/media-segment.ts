import { EncryptionKey } from './encryption-key';
import { DateRange } from './date-range';
import { ByteRange } from "./byte-range";
import { MediaInitialization } from './media-initialization';

/**
 * @see Media Segments (https://datatracker.ietf.org/doc/html/rfc8216#section-3)
 */
export interface MediaSegment {
    duration?: number;
    title?: string;
    byteRange?: ByteRange;
    discontinuity?: boolean;
    encryption?: EncryptionKey;
    mediaInitialization?: MediaInitialization;
    programDateTime?: string;
    dateRange?: DateRange;
    uri: string;
}
