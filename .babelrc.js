module.exports = {
  presets: [require.resolve('@babel/preset-react')],
  plugins: [[require.resolve('babel-plugin-import'), { libraryName: 'antd', style: 'css' }]],
}
