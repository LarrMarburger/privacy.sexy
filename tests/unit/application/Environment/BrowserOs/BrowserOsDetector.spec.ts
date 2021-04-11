import { expect } from 'chai';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { BrowserOsDetector } from '@/application/Environment/BrowserOs/BrowserOsDetector';
import { BrowserOsTestCases } from './BrowserOsTestCases';

describe('BrowserOsDetector', () => {
    it('returns undefined when user agent is undefined', () => {
        // arrange
        const expected = undefined;
        const sut = new BrowserOsDetector();
        // act
        const actual = sut.detect(undefined);
        // assert
        expect(actual).to.equal(expected);
    });
    it('detects as expected', () => {
        for (const testCase of BrowserOsTestCases) {
            // arrange
            const sut = new BrowserOsDetector();
            // act
            const actual = sut.detect(testCase.userAgent);
            // assert
            expect(actual).to.equal(testCase.expectedOs,
                `Expected: "${OperatingSystem[testCase.expectedOs]}"\n` +
                `Actual: "${OperatingSystem[actual]}"\n` +
                `UserAgent: "${testCase.userAgent}"`);
        }
    });
});
