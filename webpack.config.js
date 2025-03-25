const path = require('path');

module.exports = {
    entry: './script.js', // 엔트리 파일
    output: {
        filename: 'bundle.js', // 번들링된 파일 이름
        path: path.resolve(__dirname, 'dist'), // 출력 디렉토리
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
};