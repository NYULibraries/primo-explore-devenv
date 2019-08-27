let { VIEW, NODE_ENV, PACK, LIVE } = process.env;
NODE_ENV = NODE_ENV || 'production';

const path = require('path');
const fs = require('fs');
const resolveDevEnv = (...args) => path.join(__dirname, ...args);
const viewPath = resolveDevEnv(`./primo-explore/custom/${VIEW}`);
const centralPackagePath = resolveDevEnv(`./primo-explore/custom/CENTRAL_PACKAGE`);
const resolveViewPath = (...args) => path.resolve(viewPath, ...args);
const { DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FileManagerPlugin = require('filemanager-webpack-plugin');
const merge = require('webpack-merge');

const isPackage = PACK === 'true';
const devMode = NODE_ENV === 'development';
const prodMode = NODE_ENV === 'production';
const stagingMode = NODE_ENV === 'staging';
const testMode = NODE_ENV === 'test';
const deploymentMode = prodMode || testMode || stagingMode;
const isLive = LIVE === 'true' || !deploymentMode;

const devPlugins = [
  // plugins for development environment only
];

const deploymentPlugins = [
  // plugins for production/deployment environment
];

const packPlugins = [
  new FileManagerPlugin({
    onEnd: [
      // move important files to /tmp for zipping
      {
        mkdir: [`./`, `./html/`, `./img/`, `./css/`, `./js`].map(dir => resolveDevEnv(`./tmp/${VIEW}`, dir))
      },
      {
        copy: [{
            source: resolveViewPath(`./html/**/*.html`),
            destination: resolveDevEnv(`./tmp/${VIEW}/html`)
          },
          {
            source: resolveViewPath(`./img/**/*.{jpg,gif,png}`),
            destination: resolveDevEnv(`./tmp/${VIEW}/img`)
          },
          {
            source: resolveViewPath(`./css/**/custom1.css`),
            destination: resolveDevEnv(`./tmp/${VIEW}/css`)
          },
          {
            source: resolveViewPath(`./js/**/custom.js`),
            destination: resolveDevEnv(`./tmp/${VIEW}/js`)
          },
        ]
      },
      {
        mkdir: [
          resolveDevEnv('./packages/'),
        ]
      },
      {
        archive: [{
          source: resolveDevEnv(`./tmp/`),
          destination: resolveDevEnv(`./packages/${VIEW}.${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12) }.${prodMode ? 'production' : NODE_ENV }.zip`)
        }]
      },
      {
        delete: [resolveDevEnv(`./tmp/${VIEW}`)]
      }
    ]
  })
];

const basePlugins = [
  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new MiniCssExtractPlugin({
    filename: 'css/custom1.css',
  }),
];

// merges in webpack.config.js in the VIEW folder, if it exists
const viewWebpackOverride = basePath => fs.existsSync(path.resolve(basePath, 'webpack.config.js')) ?
  require(path.resolve(basePath, 'webpack.config.js'))
  : {};

// devServer settings
const devServer = {
  contentBase: resolveDevEnv('./primo-explore'),
  compress: false,
  host: '0.0.0.0',
  port: 8004,
  hot: isLive,
  liveReload: false,
  before: app => {
    require('./webpack/loadPrimoMiddlewares')(app);
  },
  writeToDisk: (filePath) => {
    // filePath is an absolute path to the emitted file from the devServer.
    const isCustomJS = /custom\.js$/.test(filePath);
    const isCustomCSS = /custom1\.css$/.test(filePath);
    if (isCustomJS || isCustomCSS) {
      console.log('emitted -- ', filePath);
    }
    return isCustomJS || isCustomCSS;
  },
  disableHostCheck: !prodMode,
};

const baseWebpackConfig = basePath => merge.smart(
  {
    mode: deploymentMode ? 'production' : 'development',
    context: basePath,
    entry: {
      'js/custom.js': './js/main.js',
    },
    output: {
      path: path.resolve(basePath),
      filename: '[name]',
    },
    devtool: devMode ? 'eval-source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: [
                    '>.25%',
                    'not dead',
                    'ie >= 11'
                  ]
                },
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ],
            plugins: [
              '@babel/plugin-transform-runtime'
            ],
            sourceMaps: 'both'
          }
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          loader: 'raw-loader',
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: isLive,
              }
            },
            'css-loader',
            'sass-loader',
          ]
        },
        {
          test: /\.jpe?g$|\.gif$|\.png|\.ico$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                publicPath: '../img',
                outputPath: 'img',
                name: '[name].[ext]',
              }
            },
          ],
        },
      ],
    },
    plugins: [
      ...basePlugins,
      ...(PACK === 'true' ? packPlugins : []),
      ...(deploymentMode ? deploymentPlugins : devPlugins),
    ],
  }
);

const centralPackageConfig = VIEW !== 'CENTRAL_PACKAGE' && fs.existsSync(centralPackagePath) ?
  merge.smart(
    baseWebpackConfig(centralPackagePath),
    viewWebpackOverride(centralPackagePath),
  ) : undefined;

module.exports = [
  merge.smart(
    baseWebpackConfig(viewPath),
    !isPackage ? { devServer } : {},
    viewWebpackOverride(viewPath)
  ),
  ...(centralPackageConfig && !isPackage ? [centralPackageConfig] : [])
];


