import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getInstructions, hasInstructions } from '@/presentation/components/Code/CodeButtons/Save/Instructions/InstructionListDataFactory';
import { getEnumValues } from '@/application/Common/Enum';
import { InstructionsBuilder } from '@/presentation/components/Code/CodeButtons/Save/Instructions/Data/InstructionsBuilder';

describe('InstructionListDataFactory', () => {
  const supportedOsList = [OperatingSystem.macOS];
  describe('hasInstructions', () => {
    it('return true if OS is supported', () => {
      // arrange
      const expected = true;
      // act
      const actualResults = supportedOsList.map((os) => hasInstructions(os));
      // assert
      expect(actualResults.every((result) => result === expected));
    });
    it('return false if OS is not supported', () => {
      // arrange
      const expected = false;
      const unsupportedOses = getEnumValues(OperatingSystem)
        .filter((value) => !supportedOsList.includes(value));
      // act
      const actualResults = unsupportedOses.map((os) => hasInstructions(os));
      // assert
      expect(actualResults.every((result) => result === expected));
    });
  });
  describe('getInstructions', () => {
    it('returns expected if os is supported', () => {
      // arrange
      const fileName = 'test.file';
      // act
      const actualResults = supportedOsList.map((os) => getInstructions(os, fileName));
      // assert
      expect(actualResults.every((result) => result instanceof InstructionsBuilder));
    });
  });
});
