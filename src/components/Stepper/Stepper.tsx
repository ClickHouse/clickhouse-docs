import React from 'react';
import { VerticalStepper as OriginalVerticalStepper } from '@clickhouse/click-ui/bundled';

// --- Step Component ---
interface StepProps {
    children?: React.ReactNode;
    id?: string; // step-X ID
    label?: React.ReactNode;
    forceExpanded?: string; // From parent 'expanded' state
    isFirstStep?: boolean; // Prop calculated by parent
    headerType?: string;
    [key: string]: any;
}

const Step = ({
                  children,
                  id,
                  label,
                  forceExpanded,
                  isFirstStep = false,
                  headerType,
                  ...restProps
              }: StepProps) => {

    // Determine 'active' status based on props passed from parent
    const shouldBeActive = isFirstStep || forceExpanded === 'true';
    const status: 'active' | 'complete' | 'incomplete' = shouldBeActive ? 'active' : 'incomplete';

    // Let underlying component handle expansion based on status='active'
    const collapsed = true;

    // Swap out the Click-UI Stepper label for the H2 header
    React.useEffect(() => {
        try {
            const button = document.querySelectorAll(`button[id^=${id}]`)[0];
            const divChildren = Array.from(button.children).filter(el => el.tagName === 'DIV');
            const label = divChildren[1];
            const content = button.nextElementSibling;
            const header = content.querySelectorAll(headerType)[0]
            header.style.margin = '0';
            button.append(header)
            label.remove()
        } catch (e) {
            console.log(`Error occurred in Stepper.tsx while swapping ${headerType} for Click-UI label:`, e)
        }
    }, [id, headerType]);

    // Filter out props specific to this wrapper logic
    const {
        forceExpanded: _,
        isFirstStep: __,
        ...domSafeProps // Pass the rest to the underlying component
    } = restProps;

    return (
        <OriginalVerticalStepper.Step
            label={label}
            status={status}
            collapsed={collapsed}
            id={id}
            {...domSafeProps}
        >
            {children}
        </OriginalVerticalStepper.Step>
    );
};

// --- Main VerticalStepper Component ---
interface StepperProps {
    children?: React.ReactNode;
    type?: 'numbered' | 'bulleted';
    className?: string;
    expanded?: string; // Corresponds to allExpanded in MDX
    headerLevel?: number;
    [key: string]: any;
}

// Using VerticalStepper name based on MDXComponents.js
const VStepper = ({
                      children,
                      type = 'numbered',
                      className,
                      expanded,
                      headerLevel,
                      ...props
                  }: StepperProps) => {

    // Determine if all steps should be expanded from the start
    const isExpandedMode = expanded === 'true';

    let hType = 'h2';
    if (headerLevel == 3) {
        hType = 'h3'
    }

    // Get children and filter out non-elements
    const childSteps = React.Children.toArray(children)
        .filter(child => React.isValidElement(child));

    // Extract step-X IDs (used for keys)
    const stepIds = childSteps.map((child, index) => {
        const childElement = child as React.ReactElement;
        return childElement.props.id || `step-${index + 1}`;
    });

    // Prepare children, passing down calculated state
    const enhancedChildren = childSteps.map((child, index) => {
        const childElement = child as React.ReactElement;
        const stepId = childElement.props.id || `step-${index + 1}`;
        const isFirstStep = index === 0; // Is this the first step?

        return React.cloneElement(childElement, {
            key: stepId,
            id: stepId,
            isFirstStep, // Pass down flag for first step logic
            forceExpanded: isExpandedMode ? 'true' : undefined, // Pass down expanded mode
            headerType: hType
        });
    });

    // Filter out custom props before passing to underlying component
    const { expanded: _, ...domProps } = props;

    return (
        <OriginalVerticalStepper
            type={type}
            className={className}
            {...domProps}
        >
            {enhancedChildren}
        </OriginalVerticalStepper>
    );
};

// Attach the Step component
VStepper.Step = Step;

// Export the main component
export default VStepper;
