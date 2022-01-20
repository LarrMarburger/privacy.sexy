const { resolve } = require('path');
const { defineConfig } = require('@vue/cli-service');
const packageJson = require('./package.json');

loadVueAppRuntimeVariables();

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    changeAppEntryPoint('./src/presentation/main.ts', config);
  },
  configureWebpack: {
    resolve: {
      alias: { // also requires path alias in tsconfig.json
        '@tests': resolve(__dirname, 'tests/'),
      },
      fallback: {
        /* Tell webpack to ignore polyfilling them because Node core modules are never used
            for browser code but only for desktop where Electron supports them. */
        ...ignorePolyfills('os', 'child_process', 'fs', 'path'),
      },
    },
    // Fix compilation failing on macOS when running unit/integration tests
    externals: ['fsevents'],
  },
  pluginOptions: {
    // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#native-modules
    electronBuilder: {
      mainProcessFile: './src/presentation/electron/main.ts', // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html#webpack-configuration
      nodeIntegration: true, // required to reach Node.js APIs for environment specific logic
      // https://www.electron.build/configuration/configuration
      builderOptions: {
        publish: [{
          // https://www.electron.build/configuration/publish#githuboptions
          // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#enable-publishing-to-github
          provider: 'github',
          vPrefixedTagName: false, // default: true
          releaseType: 'release', // or "draft" (default), "prerelease"
        }],
        mac: { // https://www.electron.build/configuration/mac
          target: 'dmg',
        },
        win: { // https://www.electron.build/configuration/win
          target: 'nsis',
        },
        linux: { // https://www.electron.build/configuration/linux
          target: 'AppImage',
        },
      },
    },
  },
});

function changeAppEntryPoint(entryPath, config) {
  config.entry('app').clear().add(entryPath).end();
}

function loadVueAppRuntimeVariables() {
  process.env.VUE_APP_VERSION = packageJson.version;
  process.env.VUE_APP_NAME = packageJson.name;
  process.env.VUE_APP_REPOSITORY_URL = packageJson.repository.url;
  process.env.VUE_APP_HOMEPAGE_URL = packageJson.homepage;
}

function ignorePolyfills(...moduleNames) {
  return moduleNames.reduce((obj, module) => {
    obj[module] = false;
    return obj;
  }, {});
}
