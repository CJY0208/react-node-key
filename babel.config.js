module.exports = {
  presets: [
    [
      '@babel/env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/react',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    [
      'babel-plugin-import',
      {
        libraryName: 'szfe-tools',
        camel2DashComponentName: false,
      },
    ],
    './babel',
  ],
}
