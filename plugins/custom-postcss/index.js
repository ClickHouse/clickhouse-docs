/*
We use SCSS which supports nesting, however, the minimizer with Docusaurus Faster
breaks. As a result, we need to transform our nested CSS to un-nested before minimization
*/

module.exports = function customPostCssPlugin() {
    return {
        name: "custom-postcss",
        configurePostCss(options, context) {
            options.plugins.push(require("postcss-nested"));
            options.plugins.push(require("postcss-preset-env")({
                stage: 0,
                browsers: 'last 2 versions',
            }));

            return options;
        }
    };
};
