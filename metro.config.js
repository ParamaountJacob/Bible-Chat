const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add all necessary source extensions
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'd.ts'
];

// Include all necessary asset extensions
config.resolver.assetExts = [
  'bin',
  'txt',
  'jpg',
  'png',
  'ttf',
  'otf',
  'woff',
  'woff2',
  'eot',
  'svg',
  'webp',
  'gif',
  'mp4',
  'wav',
  'mp3'
];

// Configure the watchFolders to include node_modules
config.watchFolders = [__dirname];

module.exports = config;