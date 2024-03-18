import { describe, it } from '@jest/globals';
import { expect } from 'chai';
import { Parser } from './parser';

describe('Parser', () => {
    describe('parseAttributeList()', () => {
        it('parses an empty string', () => {
            let record = new Parser().parseAttributeList('');
            expect(record).to.eql({});
        });
        it('parses a simple attribute list without quotes', () => {
            let record = new Parser().parseAttributeList('FOO=123,BAR=BAZ');
            expect(record).to.eql({ FOO: '123', BAR: 'BAZ' });
        });
        it('parses a simple attribute list with quotes', () => {
            let record = new Parser().parseAttributeList('FOO=123,BAR="baz and such",BAZ=321');
            expect(record).to.eql({ FOO: '123', BAR: 'baz and such', BAZ: "321" });
        });
        it('throws when quotes are unterminated', () => {
            expect(() => new Parser().parseAttributeList('FOO=123,BAR="baz and such')).to.throw;
        });
        it('throws when equals is missing', () => {
            expect(() => new Parser().parseAttributeList('FOO')).to.throw;
        });
        it('throws when character following quote is not comma', () => {
            expect(() => new Parser().parseAttributeList('FOO="blah"x')).to.throw;
        });
    });
});