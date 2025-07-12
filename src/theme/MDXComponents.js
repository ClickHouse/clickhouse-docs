// src/theme/MDXComponents.js
import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

// Import the custom Stepper component
// Make sure the path matches your project structure
import VStepper from '@site/src/components/Stepper/Stepper';

// Define the enhanced components
const enhancedComponents = {
    ...MDXComponents,
    ul: (props) => <ul className="custom-ul" {...props} />,
    ol: (props) => <ol className="custom-ol" {...props} />,
    li: (props) => <li className="custom-li" {...props} />,

    // Map to the components expected from the remark plugin
    Stepper: VStepper,
    Step: VStepper.Step,
};

export default enhancedComponents;