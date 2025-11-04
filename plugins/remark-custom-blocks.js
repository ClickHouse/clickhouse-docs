const { visit } = require('unist-util-visit');

// --- Helper Functions ---
const extractText = (nodes) => {
    let text = '';
    if (!nodes) return text;
    for (const node of nodes) {
        if (node.type === 'text') {
            text += node.value;
        } else if (node.children && Array.isArray(node.children)) {
            text += extractText(node.children);
        }
    }
    return text.trim();
};

const extractRawContent = (nodes) => {
    if (!nodes || !Array.isArray(nodes)) return '';
    return nodes.map(node => {
        if (node.type === 'text') {
            return node.value;
        } else if (node.type === 'inlineCode') {
            return `\`${node.value}\``;
        } else if (node.children) {
            return extractRawContent(node.children);
        }
        return '';
    }).join('');
};

// --- Main Plugin Function ---
const plugin = (options) => {
    const transformer = (tree, file) => {

        let total_steps = 0; // Keep track of the total number of steps

        // Target JSX elements in the AST
        visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
            // Look specifically for the <VerticalStepper> tag used in the markdown file
            if (node.name === 'VerticalStepper') {
                try {
                    // --- 1. Parse <VerticalStepper> Attributes ---
                    const jsxAttributes = node.attributes || [];
                    let type = "numbered"; // Default type
                    let isExpanded = true;
                    let headerLevel = 2;

                    // Extract attributes
                    jsxAttributes.forEach(attr => {
                        if (attr.type === 'mdxJsxAttribute') {
                            if (attr.name === 'type' && typeof attr.value === 'string') {
                                type = attr.value;
                            } else if (attr.name === 'headerLevel' && typeof attr.value === 'string') {
                                let set_level = attr.value
                                if (set_level === 'list') {
                                    headerLevel = 'list';
                                } else {
                                    const regex = /h([2-5])/;
                                    const match = set_level.match(regex);
                                    // If there's a match, convert the captured group to a number
                                    if (match) {
                                        headerLevel = Number(match[1]);
                                    } else {
                                        throw new Error("VerticalStepper supported only for h2-5 or 'list'");
                                    }
                                }
                            }
                        }
                    });

                    // --- 2. Process Children to Build Steps Data ---
                    const stepsData = [];
                    let currentStepContent = [];
                    let currentStepLabel = null;
                    let currentStepId = null;
                    let currentAnchorId = null;

                    const finalizeStep = () => {
                        if (currentStepLabel) {
                            stepsData.push({
                                id: currentStepId, // step-X ID
                                label: currentStepLabel, // Plain text label
                                anchorId: currentAnchorId,
                                content: [...currentStepContent],
                            });
                            total_steps++;
                        }
                        currentStepContent = [];
                        currentStepLabel = null; // Reset label
                    };

                    if (node.children && node.children.length > 0) {
                        if (headerLevel === 'list') {
                            // Handle ordered list mode
                            node.children.forEach((child) => {
                                if (child.type === 'list' && child.ordered === true) {
                                    // Process each list item as a step
                                    child.children.forEach((listItem) => {
                                        if (listItem.type === 'listItem' && listItem.children && listItem.children.length > 0) {
                                            finalizeStep(); // Finalize the previous step first
                                            // Extract the first paragraph as the step label
                                            const firstChild = listItem.children[0];
                                            if (firstChild && firstChild.type === 'paragraph') {
                                                currentStepLabel = firstChild.children;
                                                currentStepId = `step-${total_steps}`;
                                                currentAnchorId = null;
                                                // Include all list item content except the first paragraph (which becomes the label)
                                                currentStepContent.push(...listItem.children.slice(1));
                                            }
                                        }
                                    });
                                } else {
                                    // Include other content (like paragraphs, images, etc.) in the current step
                                    if (currentStepLabel) {
                                        currentStepContent.push(child);
                                    }
                                }
                            });
                        } else {
                            // Handle heading mode (original logic)
                            node.children.forEach((child) => {
                                if (child.type === 'heading' && child.depth === headerLevel) {
                                    finalizeStep(); // Finalize the previous step first
                                    currentStepLabel = extractText(child.children);
                                    currentAnchorId = child.data?.hProperties?.id || null;
                                    currentStepId = `step-${total_steps}`; // Generate step-X ID
                                    currentStepContent.push(child); // We need the header otherwise onBrokenAnchors fails
                                } else if (currentStepLabel) {
                                    // Only collect content nodes *after* a heading has defined a step
                                    currentStepContent.push(child);
                                }
                            });
                        }
                    }
                    finalizeStep(); // Finalize the last step found

                    // --- 3. Transform Parent Node ---
                    // Transforms to <Stepper/> to match src/theme/MDXComponents.js
                    node.name = 'Stepper';
                    node.children = []; // Clear original children

                    // Set attributes
                    node.attributes = [
                        { type: 'mdxJsxAttribute', name: 'type', value: type },
                        { type: 'mdxJsxAttribute', name: 'headerLevel', value: headerLevel },
                    ];
                    if (isExpanded) {
                        node.attributes.push({
                            type: 'mdxJsxAttribute',
                            name: 'expanded', // Pass 'expanded' prop to React component
                            value: 'true'
                        });
                    }

                    // --- 4. Generate Child <Step> Nodes ---
                    stepsData.forEach(step => {
                        // Basic attributes for Step
                        const stepAttributes = [
                            { type: 'mdxJsxAttribute', name: 'id', value: step.id }, // step-X
                        ];

                        // Add the label - for list mode, we'll create a special label element
                        if (headerLevel === 'list' && Array.isArray(step.label)) {
                            // For list mode, create a paragraph element with the label content and add it to the step children
                            const labelParagraph = {
                                type: 'paragraph',
                                children: [...step.label]
                            };
                            step.content.unshift(labelParagraph);
                            
                            // Use plain text for the label attribute
                            stepAttributes.push({
                                type: 'mdxJsxAttribute',
                                name: 'label',
                                value: extractRawContent(step.label)
                            });
                        } else {
                            stepAttributes.push({
                                type: 'mdxJsxAttribute',
                                name: 'label',
                                value: step.label
                            });
                        }

                        // Add forceExpanded attribute if parent was expanded
                        // (Matches React prop name used before anchor logic)
                        if (isExpanded) {
                            stepAttributes.push({
                                type: 'mdxJsxAttribute',
                                name: 'forceExpanded',
                                value: 'true'
                            });
                        }

                        // Push the Step node
                        node.children.push({
                            type: 'mdxJsxFlowElement',
                            name: 'Step', // Output Step tag
                            attributes: stepAttributes,
                            children: [...step.content], // Pass content nodes as children
                        });
                    });
                } catch (error) {
                    const filePath = file?.path || 'unknown file';
                    // Added error logging
                    console.error(`Error processing <VStepper> in ${filePath}:`, error);
                }
            }
        });
    };
    return transformer;
};

module.exports = plugin;
