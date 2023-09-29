const path = require("path");
const StringReplacePlugin = require("string-replace-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function(inputFile, siteId, WebpackObfuscator) {
    // Convert site url to base64
    const siteIdInBase64 = Buffer.from(siteId, 'binary').toString('base64');
    return {
        entry: inputFile,
        mode: 'production',
        target: 'web',
        optimization: {
          minimize: true,
          minimizer: [
              new TerserPlugin({
                  parallel: true,
                  terserOptions: {
                      output: {
                          comments: false,
                      },
                  },
              }),
          ],
      },
        output: {
            filename: 'build/output.js',
        },
        module: {
            rules: [
              {
                test: /\.js$/,
                use: [
                  {
                    loader: StringReplacePlugin.replace({
                      replacements: [
                        {
                          pattern: /TEAM--LICENSE-KEY/g,
                          replacement: function (match, p1, offset, string) {
                            // Return the string you want to replace it with
                            return siteIdInBase64;
                          },
                        },
                      ],
                    }),
                  },
                  {
                    loader: WebpackObfuscator.loader, 
                    options: {
                      compact: true,
                      controlFlowFlattening: true,
                      controlFlowFlatteningThreshold: 1,
                      numbersToExpressions: true,
                      simplify: true,
                      stringArrayShuffle: true,
                      stringArrayThreshold: 1,
                    }
                  }
                ],
              },
            ],
        }
    }
}