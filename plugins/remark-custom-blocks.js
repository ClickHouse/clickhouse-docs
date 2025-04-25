const { visit } = require('unist-util-visit');

// Log when the plugin file is loaded by Node.js
console.log('[remark-custom-blocks] Loading plugin from:', __filename);

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

// Specific handler for the <VStepper> element
function handleVStepperElement(node, file) {
    const filePath = file?.path || 'unknown file';
    console.log(`\n[remark-custom-blocks] --- Processing <VStepper> in ${filePath} ---`);

    // --- 1. Parse <VStepper> Attributes and Determine Mode ---
    const jsxAttributes = node.attributes || [];
    const parentProps = {}; // Props to pass to the final <VerticalStepper>
    let config = {};
    let mode = 'default'; // 'default' (firstActiveOnly), 'allExpanded', 'custom'

    const typeAttr = jsxAttributes.find(attr => attr.type === 'mdxJsxAttribute' && attr.name === 'type');
    if (typeAttr && typeof typeAttr.value === 'string') {
        parentProps.type = typeAttr.value;
    }

    const configAttr = jsxAttributes.find(attr => attr.type === 'mdxJsxAttribute' && attr.name === 'config');
    if (configAttr && typeof configAttr.value === 'string') {
        try {
            config = JSON.parse(configAttr.value);
            mode = 'custom';
            console.log('[remark-custom-blocks] Using CUSTOM mode.');
        } catch (e) {
            console.error(`[remark-custom-blocks] Invalid JSON in config attribute for ${filePath}: ${configAttr.value}`, e);
            mode = 'default';
        }
    } else {
        const allExpandedAttr = jsxAttributes.find(attr => attr.type === 'mdxJsxAttribute' && attr.name === 'allExpanded');
        if (allExpandedAttr) {
            mode = 'allExpanded';
            console.log('[remark-custom-blocks] Using allExpanded mode.');
        } else {
            console.log('[remark-custom-blocks] Using default mode.');
        }
    }

    // --- 2. Process Children (Content inside <VStepper>) to Build Steps Data ---
    const stepsData = [];
    let currentStepContent = [];
    let currentStepLabel = null;
    let currentStepId = null;
    let firstStepId = null;
    const allStepIds = [];
    let headingDepth = 2; // Assuming H2 defines steps

    const finalizeStep = () => {
        if (currentStepLabel) {
            stepsData.push({
                id: currentStepId,
                label: currentStepLabel,
                content: [...currentStepContent],
            });
        }
        currentStepContent = [];
    };

    if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
            if (child.type === 'heading' && child.depth === headingDepth) {
                finalizeStep();
                currentStepLabel = extractText(child.children);
                currentStepId = `step-${stepsData.length + 1}`;
                allStepIds.push(currentStepId);
                if (!firstStepId) {
                    firstStepId = currentStepId;
                }
            } else if (currentStepLabel) {
                currentStepContent.push(child);
            }
        });
    }
    finalizeStep(); // Finalize the last step
    console.log(`[remark-custom-blocks] Found ${stepsData.length} steps.`);


    // --- 3. Transform Parent Node (<VStepper> to <VerticalStepper>) ---
    node.name = 'VerticalStepper'; // Rename the element to the actual component
    node.children = []; // Clear original children
    node.attributes = []; // Reset attributes

    // Add parent props (like 'type')
    Object.entries(parentProps).forEach(([key, value]) => {
        node.attributes.push({ type: 'mdxJsxAttribute', name: key, value: value });
    });

    // --- 4. Determine Active/Shown State based on Mode ---
    let activeStepId = null;
    let showStepIds = [];
    let completedStepIds = [];

    if (mode === 'custom') {
        activeStepId = config.initialActiveId || null;
        showStepIds = config.initialShowIds || [];
        completedStepIds = config.initialCompletedIds || [];
    } else if (mode === 'allExpanded') {
        activeStepId = firstStepId || null;
        showStepIds = allStepIds;
    } else { // Default mode
        activeStepId = firstStepId || null;
        showStepIds = firstStepId ? [firstStepId] : [];
    }

    // --- 5. Generate Child <Step> Nodes with State Props ---
    stepsData.forEach(step => {
        const isActive = step.id === activeStepId;
        const isShown = showStepIds.includes(step.id);
        const isCompleted = completedStepIds.includes(step.id);
        let status = 'incomplete';
        if (isActive) status = 'active';
        else if (isCompleted) status = 'complete';

        // --- This is the boolean JS value ---
        const collapsed = !isShown;
        // ----------------------------------

        // Build attributes for this Step component
        const stepAttributes = [
            { type: 'mdxJsxAttribute', name: 'id', value: step.id },
            { type: 'mdxJsxAttribute', name: 'label', value: step.label },
            { type: 'mdxJsxAttribute', name: 'status', value: status },
        ];

        // --- USE BOOLEAN ATTRIBUTE CONVENTION ---
        // Add the 'collapsed' attribute ONLY if its value is true
        if (collapsed === true) {
            stepAttributes.push({
                type: 'mdxJsxAttribute',
                name: 'collapsed',
                value: null // Represents collapsed={true}
            });
            // console.log(`[remark-custom-blocks] Step ${step.id}: Adding 'collapsed' attribute (as true)`);
        } else {
            // console.log(`[remark-custom-blocks] Step ${step.id}: Omitting 'collapsed' attribute (as false)`);
        }
        // --- END BOOLEAN ATTRIBUTE HANDLING ---

        // Push the Step node to the parent's children
        node.children.push({
            type: 'mdxJsxFlowElement',
            name: 'Step', // Use 'Step' - mapping happens in MDXComponents.js
            attributes: stepAttributes,
            children: step.content, // Content AST nodes
        });
    });

    console.log(`[remark-custom-blocks] Transformed <VStepper> in ${filePath} into <VerticalStepper> with ${node.children.length} steps.`);

} // <--- End of handleVStepperElement function


// --- Main Plugin Function ---
const plugin = (options) => {
    const transformer = (tree, file) => {
        // Target JSX elements
        visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
            // Route handling based on the element name used in Markdown
            switch (node.name) {
                case 'VStepper':
                    try {
                        handleVStepperElement(node, file);
                    } catch (error) {
                        const filePath = file?.path || 'unknown file';
                        console.error(`[remark-custom-blocks] Error processing <VStepper> in ${filePath}:`, error);
                    }
                    break;
                // Add more cases here later for other custom elements
                default:
                    break;
            }
        });
    };
    return transformer;
};

module.exports = plugin;
