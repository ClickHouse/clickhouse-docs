const {filterTokens} = require('./utility_functions.js');

/*
A custom rule that requires headings to have an explicit heading id.

E.g. ### Hello World {#my-explicit-id}

This is required as LLM translations break anchors by translating the heading
*/

module.exports = {
    names: ['custom-anchor-headings'],
    tags: ["headings"],
    description: 'Headings should have an explicit heading id',
    function: (params, onError) => {
        filterTokens(params, "heading_open", (token) => {
            const headingLine = params.lines[token.map[0]];
            console.log(headingLine)
            const hasCustomId = /\{#./.test(headingLine);
            if (!hasCustomId) {
                onError({
                    lineNumber: token.map[0] + 1, // Line number is 1-based
                    details: `${headingLine.trim()} is missing an explicit ID (e.g., {#my-custom-id}).`,
                    context: headingLine,
                });
            };
        });
    },
};