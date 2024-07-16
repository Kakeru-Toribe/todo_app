// See the shakacode/shakapacker README and docs directory for advice on customizing your webpackConfig.
const { generateWebpackConfig, merge } = require('shakapacker')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const webpackConfig = generateWebpackConfig()

module.exports = merge(
  webpackConfig, {
    plugins: [new ForkTsCheckerWebpackPlugin()],
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            'style-loader', // インラインスタイルとしてバンドルに追加
            'css-loader',   // CSSをCommonJSに変換
            'sass-loader'   // SassをCSSにコンパイル
          ],
        },
      ],
    },
  }
);
