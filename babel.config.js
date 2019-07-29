export default {
  "presets": [
    ["@babel/preset-env", {
      targets: {
        browsers: [
          ">.25%",
          "not dead",
          "ie >= 11",
        ]
      },
      useBuiltIns: "usage",
      corejs: 3,
    }]
  ],
  plugins: [
    // "transform-html-import-to-string",
    "@babel/plugin-transform-runtime",
  ],
  sourceMaps: "both"
};