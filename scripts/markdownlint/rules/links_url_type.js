const { forEachLine, getLineMetadata, isBlankLine } = require(`markdownlint-rule-helpers`);
const {filterTokens} = require('./utility_functions.js');

// A custom rule to find relative links to .md files
module.exports = {
    names: ['links-url-type'],
    tags: ["links"],
    description: 'Links should not use relative paths to files',
    function: (params, onError) => {
        filterTokens(params, "inline", (token) => {
            const children = token.children ?? [];
            for (const child of children) {
                const {type, attrs, lineNumber} = child;

                let hrefSrc;

                if (type === "link_open") {
                    for (const attr of attrs) {
                        if (attr[0] === "href") {
                            hrefSrc = attr[1];
                            break;
                        }
                    }
                }

                if (type === "image") {
                    continue; // checking for image urls can be implemented here if needed
                }

                if (hrefSrc && isRelativeToFileStylePath(hrefSrc)){
                    onError({
                        lineNumber,
                        detail: `${hrefSrc}`,
                    })
                }
            }
        })
    },
};

function isRelativeToFileStylePath(path) {
    const relativeFilePathRegex = /^\.{1,2}\/(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)\.(?:md|mdx)$/i;
    return relativeFilePathRegex.test(path);
}

