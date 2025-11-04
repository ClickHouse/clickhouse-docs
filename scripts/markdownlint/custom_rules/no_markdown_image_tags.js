const { forEachLine, getLineMetadata, isBlankLine } = require(`markdownlint-rule-helpers`);
const {filterTokens} = require('./utility_functions.js');

// A custom rule to disallow markdown image tags like ![text](url)
module.exports = {
    names: ['no-markdown-image-tags'],
    tags: ["images"],
    description: 'Disallows markdown image tags. Prefer img tag instead',
    function: (params, onError) => {
        filterTokens(params, "inline", (token) => {
            const children = token.children ?? [];
            for (const child of children) {
                const { type, lineNumber, content } = child;

                if (type === "image") {
                    onError({
                        lineNumber,
                        detail: `Markdown image tag found: ![${content}](${child.attrs.find(attr => attr[0] === 'src')[1]})`,
                    });
                }
            }
        });
    },
};

