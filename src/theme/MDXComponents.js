import MDXComponents from '@theme-original/MDXComponents';
import VerticalStepper from '@site/src/components/VerticalStepper/VerticalStepper';

export default {
    // Re-use the default mapping
    ...MDXComponents,
    // Add custom components to the mapping
    VerticalStepper: VerticalStepper,
    Step: VerticalStepper.Step,
};