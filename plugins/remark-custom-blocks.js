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

// --- Main Plugin Function ---
const plugin = (options) => {
    const transformer = (tree, file) => {

        // Target JSX elements in the AST
        visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
            // Look specifically for the <VerticlStepper> tag used in the markdown file
            if (node.name === 'VerticalStepper') {
                try {
                    // --- 1. Parse <VerticalStepper> Attributes ---
                    const jsxAttributes = node.attributes || [];
                    let type = "numbered"; // Default type
                    let isExpanded = true;

                    // Extract attributes
                    jsxAttributes.forEach(attr => {
                        if (attr.type === 'mdxJsxAttribute') {
                            if (attr.name === 'type' && typeof attr.value === 'string') {
                                type = attr.value;
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
                        }
                        currentStepContent = [];
                        currentStepLabel = null; // Reset label
                    };

                    if (node.children && node.children.length > 0) {
                        node.children.forEach((child) => {
                            if (child.type === 'heading' && child.depth === 2) {
                                finalizeStep(); // Finalize the previous step first
                                currentStepLabel = extractText(child.children);
                                currentAnchorId = child.data.hProperties.id;
                                currentStepId = `step-${stepsData.length + 1}`; // Generate step-X ID
                                currentStepContent.push(child); // We need the header otherwise onBrokenAnchors fails
                            } else if (currentStepLabel) {
                                // Only collect content nodes *after* a heading has defined a step
                                currentStepContent.push(child);
                            }
                        });
                    }
                    finalizeStep(); // Finalize the last step found

                    // --- 3. Transform Parent Node ---
                    // Transforms to <Stepper/> to match src/theme/MDXComponents.js
                    node.name = 'Stepper';
                    node.children = []; // Clear original children

                    // Set attributes
                    node.attributes = [
                        { type: 'mdxJsxAttribute', name: 'type', value: type },
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
                            { type: 'mdxJsxAttribute', name: 'label', value: step.label }, // Plain text
                        ];

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
