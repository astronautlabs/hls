import { SCTE35 } from './scte35';

/**
 * @see EXT-X-DATERANGE (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.7)
 */
export interface DateRange {
    id: string;
    class?: string;
    startDate: string;
    endDate?: string;
    duration: number;
    plannedDuration?: number;
    scte35?: SCTE35;
    attributes: Record<string, string>;
    endOnNext?: boolean;
}
