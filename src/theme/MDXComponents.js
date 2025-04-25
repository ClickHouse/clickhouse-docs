// src/theme/MDXComponents.js
import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

// Import the custom Stepper component
// Make sure the path matches your project structure
import VerticalStepper from '@site/src/components/Stepper/Stepper';

// Define the enhanced components
const enhancedComponents = {
    ...MDXComponents,

    // Map to the components expected from the remark plugin
    VerticalStepper: VerticalStepper,
    Step: VerticalStepper.Step,
};

// Debug info
console.log('MDXComponents mapping loaded', {
    hasVerticalStepper: !!VerticalStepper,
    hasStep: !!(VerticalStepper && VerticalStepper.Step)
});

export default enhancedComponents;