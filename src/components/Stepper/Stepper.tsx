// src/components/Stepper/Stepper.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Import the ORIGINAL library component
import { VerticalStepper as OriginalVerticalStepper } from '@clickhouse/click-ui/bundled';

// --- Step Component ---
interface StepProps {
    children?: React.ReactNode;
    id?: string;
    label?: React.ReactNode;
    forceExpanded?: string; // String attribute from remark plugin
    isActive?: boolean; // Passed from parent
    [key: string]: any;
}

const Step = ({
                  children,
                  id,
                  label,
                  forceExpanded,
                  isActive = false,
                  ...restProps
              }: StepProps) => {
    // Determine if this step should be expanded
    // Either it's forced expanded or it's the active step
    const isExpanded = forceExpanded === 'true' || isActive;

    // Convert to proper props for original component
    const status: 'active' | 'incomplete' = isExpanded ? 'active' : 'incomplete';
    const collapsed = !isExpanded;

    console.log(`Step ${id}: forceExpanded=${forceExpanded}, isActive=${isActive}, collapsed=${collapsed}`);

    // Filter out props that shouldn't go to DOM
    const { forceExpanded: _, isActive: __, ...domSafeProps } = restProps;

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
    expanded?: string; // String attribute from remark plugin
    [key: string]: any;
}

const VerticalStepper = ({
                             children,
                             type = 'numbered',
                             className,
                             expanded, // String from remark plugin
                             ...props
                         }: StepperProps) => {
    // Component-wide expanded mode
    const isExpandedMode = expanded === 'true';
    console.log(`VerticalStepper: expanded=${expanded}, isExpandedMode=${isExpandedMode}`);

    // For non-expanded mode, we need active step tracking
    const [activeStepId, setActiveStepId] = useState<string | null>(null);

    // Get array of child steps
    const childSteps = React.Children.toArray(children)
        .filter(child => React.isValidElement(child) && child.type === Step);

    // If not in expanded mode, set the first step as active initially
    useEffect(() => {
        if (!isExpandedMode && childSteps.length > 0 && !activeStepId) {
            const firstStep = childSteps[0] as React.ReactElement;
            const firstStepId = firstStep.props.id || 'step-1';
            console.log(`Setting initial active step: ${firstStepId}`);
            setActiveStepId(firstStepId);
        }
    }, [childSteps, isExpandedMode, activeStepId]);

    // Prepare children with keys and active state
    const enhancedChildren = childSteps.map((child, index) => {
        const childElement = child as React.ReactElement;
        const stepId = childElement.props.id || `step-${index + 1}`;
        const isActive = stepId === activeStepId;

        return React.cloneElement(childElement, {
            key: stepId,
            id: stepId,
            isActive,
        });
    });

    // Handle step click
    const handleStepClick = (stepId: string) => {
        if (!isExpandedMode) {
            console.log(`Activating step: ${stepId}`);
            setActiveStepId(stepId);
        }
    };

    // Filter out custom props
    const { expanded: _, ...domProps } = props;

    return (
        <div className={className}
             onClick={(e) => {
                 // Find closest step element and activate it
                 const stepEl = (e.target as HTMLElement).closest('[data-step-id]');
                 if (stepEl) {
                     const stepId = stepEl.getAttribute('data-step-id');
                     if (stepId) handleStepClick(stepId);
                 }
             }}>
            <OriginalVerticalStepper type={type} {...domProps}>
                {enhancedChildren}
            </OriginalVerticalStepper>
        </div>
    );
};

// Attach the Step for mapping purposes
VerticalStepper.Step = Step;

export default VerticalStepper;