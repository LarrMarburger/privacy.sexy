import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IInstructionsBuilderData, InstructionsBuilder, InstructionStepBuilderType } from '@/presentation/components/Code/CodeButtons/Save/Instructions/Data/InstructionsBuilder';
import { IInstructionInfo, IInstructionListStep } from '@/presentation/components/Code/CodeButtons/Save/Instructions/InstructionListData';

describe('InstructionsBuilder', () => {
  describe('withStep', () => {
    it('returns itself', () => {
      // arrange
      const expected = new InstructionsBuilder(OperatingSystem.Android);
      const step = () => createMockStep();
      // act
      const actual = expected.withStep(step);
      // assert
      expect(actual).to.equal(expected);
    });
  });
  describe('build', () => {
    it('builds with given data', () => {
      // arrange
      const expectedData = createMockData();
      const actualData = Array<IInstructionsBuilderData>();
      const builder = new InstructionsBuilder(OperatingSystem.Android);
      const steps: readonly InstructionStepBuilderType[] = [createMockStep(), createMockStep()]
        .map((step) => (data) => {
          actualData.push(data);
          return step;
        });
      for (const step of steps) {
        builder.withStep(step);
      }
      // act
      builder.build(expectedData);
      // assert
      expect(actualData.every((data) => data === expectedData));
    });
    it('builds with every step', () => {
      // arrange
      const expectedSteps = [
        createMockStep('first'),
        createMockStep('second'),
        createMockStep('third'),
      ];
      const builder = new InstructionsBuilder(OperatingSystem.Android);
      const steps: readonly InstructionStepBuilderType[] = expectedSteps.map((step) => () => step);
      for (const step of steps) {
        builder.withStep(step);
      }
      // act
      const data = builder.build(createMockData());
      // assert
      const actualSteps = data.steps;
      expect(actualSteps).to.have.members(expectedSteps);
    });
    it('builds with expected OS', () => {
      // arrange
      const expected = OperatingSystem.Linux;
      const sut = new InstructionsBuilder(expected);
      // act
      const actual = sut.build(createMockData()).operatingSystem;
      // assert
      expect(true);
      expect(actual).to.equal(expected);
    });
  });
});

function createMockData(): IInstructionsBuilderData {
  return {
    fileName: 'instructions-file',
  };
}

function createMockStep(identifier = 'mock step'): IInstructionListStep {
  return {
    action: createMockInfo(`${identifier} | action`),
    code: createMockInfo(`${identifier} | code`),
  };
}

function createMockInfo(identifier = 'mock info'): IInstructionInfo {
  return {
    instruction: `${identifier} | mock instruction`,
    details: `${identifier} | mock details`,
  };
}
