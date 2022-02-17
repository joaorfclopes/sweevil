module.exports = {
  entry: './src/index.js',
  mode: 'production',
  node: {
    fs: 'empty'
  },
  resolve: {
    fallback: {
      process: require.resolve('process/browser'),
      path: require.resolve('path-browserify')
    }
  }
}
