/**
 * Metro config for the Supr UI demo app (Expo SDK 55 tooling).
 *
 * Monorepo wiring: @mrtechnology/ui-native and @mrtechnology/tokens are workspace packages
 * symlinked into this app's node_modules, and their real sources live at
 * the repo root. Metro must watch the whole workspace and resolve modules
 * from the root node_modules as well as this app's own, or the workspace
 * imports fail to bundle.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
