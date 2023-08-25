import { describe } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { convertPlatformToOs } from '@/presentation/electron/preload/NodeOsMapper';

describe('NodeOsMapper', () => {
  describe('convertPlatformToOs', () => {
    describe('determines desktop OS', () => {
      // arrange
      interface IDesktopTestCase {
        nodePlatform: NodeJS.Platform;
        expectedOs: OperatingSystem;
      }
      const testCases: readonly IDesktopTestCase[] = [ // https://nodejs.org/api/process.html#process_process_platform
        {
          nodePlatform: 'aix',
          expectedOs: undefined,
        },
        {
          nodePlatform: 'darwin',
          expectedOs: OperatingSystem.macOS,
        },
        {
          nodePlatform: 'freebsd',
          expectedOs: undefined,
        },
        {
          nodePlatform: 'linux',
          expectedOs: OperatingSystem.Linux,
        },
        {
          nodePlatform: 'openbsd',
          expectedOs: undefined,
        },
        {
          nodePlatform: 'sunos',
          expectedOs: undefined,
        },
        {
          nodePlatform: 'win32',
          expectedOs: OperatingSystem.Windows,
        },
      ];
      testCases.forEach(({ nodePlatform, expectedOs }) => {
        it(nodePlatform, () => {
          // act
          const actualOs = convertPlatformToOs(nodePlatform);
          // assert
          expect(actualOs).to.equal(expectedOs, printMessage());
          function printMessage(): string {
            return `Expected: "${OperatingSystem[expectedOs]}"\n`
              + `Actual: "${OperatingSystem[actualOs]}"\n`
              + `Platform: "${nodePlatform}"`;
          }
        });
      });
    });
  });
});
