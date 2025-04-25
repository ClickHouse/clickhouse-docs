// plugins/remark-custom-blocks.js
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
            // Look specifically for the <VStepper> tag used in Markdown source
            if (node.name === 'VStepper') {
                try {
                    console.log('Processing VStepper tag');

                    // --- 1. Parse <VStepper> Attributes ---
                    const jsxAttributes = node.attributes || [];
                    let type = "numbered"; // Default type
                    let isExpanded = false; // Default not expanded

                    // Extract attributes
                    jsxAttributes.forEach(attr => {
                        if (attr.type === 'mdxJsxAttribute') {
                            if (attr.name === 'type' && typeof attr.value === 'string') {
                                type = attr.value;
                                console.log(`Found type: ${type}`);
                            }
                            else if (attr.name === 'allExpanded') {
                                isExpanded = true;
                                console.log('Found allExpanded attribute');
                            }
                        }
                    });

                    // --- 2. Process Children to Build Steps Data ---
                    const stepsData = [];
                    let currentStepContent = [];
                    let currentStepLabel = null;
                    let currentStepId = null;

                    const finalizeStep = () => {
                        if (currentStepLabel) {
                            stepsData.push({
                                id: currentStepId,
                                label: currentStepLabel,
                                content: [...currentStepContent], // Collect content AST nodes
                            });
                            console.log(`Finalized step: ${currentStepLabel}`);
                        }
                        currentStepContent = [];
                    };

                    if (node.children && node.children.length > 0) {
                        node.children.forEach((child) => {
                            if (child.type === 'heading' && child.depth === 2) {
                                finalizeStep(); // Finalize the previous step first
                                currentStepLabel = extractText(child.children);
                                currentStepId = `step-${stepsData.length + 1}`;
                                console.log(`Found heading: ${currentStepLabel}`);
                            } else if (currentStepLabel) {
                                // Only collect content nodes *after* a heading has defined a step
                                currentStepContent.push(child);
                            }
                        });
                    }
                    finalizeStep(); // Finalize the last step found

                    console.log(`Found ${stepsData.length} steps`);

                    // --- 3. Transform Parent Node (<VStepper> to <VerticalStepper>) ---
                    node.name = 'VerticalStepper'; // Use the name expected by MDXComponents mapping
                    node.children = []; // Clear original children from <VStepper> tag

                    // Set attributes - using a simple string for expanded mode
                    node.attributes = [
                        { type: 'mdxJsxAttribute', name: 'type', value: type },
                    ];

                    // Add expanded attribute as a string (safer than boolean in MDX)
                    if (isExpanded) {
                        node.attributes.push({
                            type: 'mdxJsxAttribute',
                            name: 'expanded',
                            value: 'true'
                        });
                        console.log('Added expanded="true" attribute');
                    }

                    // --- 4. Generate Child <Step> Nodes ---
                    stepsData.forEach(step => {
                        // Basic attributes for Step
                        const stepAttributes = [
                            { type: 'mdxJsxAttribute', name: 'id', value: step.id },
                            { type: 'mdxJsxAttribute', name: 'label', value: step.label },
                        ];

                        // If expanded mode, add a "forceExpanded" attribute to each step
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
                            name: 'Step',
                            attributes: stepAttributes,
                            children: step.content,
                        });
                        console.log(`Added step: ${step.label}`);
                    });
                } catch (error) {
                    const filePath = file?.path || 'unknown file';
                    console.error(`Error processing <VStepper> in ${filePath}:`, error);
                }
            }
        });
    };
    return transformer;
};

module.exports = plugin;