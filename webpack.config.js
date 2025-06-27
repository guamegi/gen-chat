const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/index.js", // 엔트리 파일
  output: {
    filename: "bundle.js", // 번들링된 파일 이름
    path: path.resolve(__dirname, "dist"), // 출력 디렉토리
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new Dotenv()],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 8082,
    open: true,
  },
};
