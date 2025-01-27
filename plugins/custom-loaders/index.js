module.exports = function (context, options) {
    return {
        name: 'custom-loaders',
        configureWebpack(config, isServer) {
            return {
                module: {
                    rules: [
                        {
                            test: /\.jsx$/,
                            // Exclude node_modules to avoid conflicts
                            exclude: /node_modules\/(?!(@yaireo\/tagify)\/)/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    "presets": [
                                        ["@babel/preset-react", {
                                            "runtime": "automatic"
                                        }]
                                    ]
                                },
                            },
                        },
                    ],
                },
            };
        },
    };
};