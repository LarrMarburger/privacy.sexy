import 'mocha';
import { expect } from 'chai';
import { DocumentableData } from 'js-yaml-loader!@/*';
import { parseDocUrls } from '@/application/Parser/DocumentationParser';

describe('DocumentationParser', () => {
    describe('parseDocUrls', () => {
        it('throws when undefined', () => {
            expect(() => parseDocUrls(undefined)).to.throw('documentable is null or undefined');
        });
        it('returns empty when empty', () => {
            // arrange
            const empty: DocumentableData = { };
            // act
            const actual = parseDocUrls(empty);
            // assert
            expect(actual).to.have.lengthOf(0);
        });
        it('returns single item when string', () => {
            // arrange
            const url = 'https://privacy.sexy';
            const expected = [ url ];
            const sut: DocumentableData = { docs: url };
            // act
            const actual = parseDocUrls(sut);
            // assert
            expect(actual).to.deep.equal(expected);
        });
        it('returns all when array', () => {
            // arrange
            const expected = [ 'https://privacy.sexy', 'https://github.com/undergroundwires/privacy.sexy' ];
            const sut: DocumentableData = { docs: expected };
            // act
            const actual = parseDocUrls(sut);
            // assert
            expect(actual).to.deep.equal(expected);
        });
    });
});
