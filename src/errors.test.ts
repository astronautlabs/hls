import { describe, it } from "@jest/globals";
import { expect } from "chai";
import { Parser } from "./parser";

describe('Parser', () => {
    describe('parse()', () => {
        it('throws when #EXTM3U is missing', () => {
            expect(() => new Parser().parse(`#EXT-X-TARGETDURATION:10\n#EXTINF 10,\nsegment1.ts`)).to.throw(/missing #EXTM3U/i);
        });
        it('throws when #EXT-X-TARGETDURATION is missing', () => {
            expect(() => new Parser().parse(`#EXTM3U\n#EXTINF 10,\nsegment1.ts`)).to.throw(/missing #EXT-X-TARGETDURATION/i);
        });
        it('throws when #EXTINF is missing', () => {
            expect(() => new Parser().parse(`#EXTM3U\n#EXT-X-TARGETDURATION:10\nsegment1.ts`)).to.throw(/missing #EXTINF/i);
        });
    });
})