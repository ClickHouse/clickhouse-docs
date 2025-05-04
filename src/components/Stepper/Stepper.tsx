import React, { useState, useEffect } from 'react';
import { VerticalStepper as OriginalVerticalStepper } from '@clickhouse/click-ui/bundled';

// --- Step Component ---
interface StepProps {
    children?: React.ReactNode;
    id?: string; // step-X ID
    label?: React.ReactNode;
    forceExpanded?: string; // From parent 'expanded' state
    isFirstStep?: boolean; // Prop calculated by parent
    isActiveStep?: boolean; // Prop calculated by parent (based on state/scroll)
    [key: string]: any;
}

const Step = ({
                  children,
                  id,
                  label,
                  forceExpanded,
                  isFirstStep = false,
                  isActiveStep = false,
                  ...restProps
              }: StepProps) => {

    // Determine 'active' status based on props passed from parent
    const shouldBeActive = isFirstStep || isActiveStep || forceExpanded === 'true';
    const status: 'active' | 'complete' | 'incomplete' = shouldBeActive ? 'active' : 'incomplete';

    // Let underlying component handle expansion based on status='active'
    // We pass collapsed=true, relying on status='active' to override it.
    const collapsed = true;

    // Swap out the Click-UI Stepper label (shown next to the numbered circle) for the
    // H2 header so that Docusaurus doesn't fail on broken anchor checks
    useEffect(() => {
        try {
            const button = document.querySelectorAll(`button[id^=${id}]`)[0];
            const divChildren = Array.from(button.children).filter(el => el.tagName === 'DIV');
            const label = divChildren[1];
            const content = button.nextElementSibling;
            const header = content.querySelectorAll('h2')[0]
            header.style.margin = '0';
            button.append(header)
            label.remove()
        } catch (e) {
            console.log('Error occurred in Stepper.tsx while swapping H2 for Click-UI label')
        }
    }, []);

    // Filter out props specific to this wrapper logic
    const {
        forceExpanded: _,
        isFirstStep: __,
        isActiveStep: ___,
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
    [key: string]: any;
}

// Using VerticalStepper name based on MDXComponents.js
const VStepper = ({
                             children,
                             type = 'numbered',
                             className,
                             expanded, // 'true' if allExpanded was set
                             ...props
                         }: StepperProps) => {

    // State for tracking active steps via scroll/click
    const [activeStepIds, setActiveStepIds] = useState<Set<string>>(new Set());

    // Determine if all steps should be expanded from the start
    const isExpandedMode = expanded === 'true';

    // Get children and filter out non-elements
    const childSteps = React.Children.toArray(children)
        .filter(child => React.isValidElement(child));

    // Extract step-X IDs (used for state tracking and keys)
    const stepIds = childSteps.map((child, index) => {
        const childElement = child as React.ReactElement;
        return childElement.props.id || `step-${index + 1}`;
    });

    // --- Scroll Listener Effect ---
    // This is currently not used, but we may want to include it at a later stage
    useEffect(() => {
        if (isExpandedMode) return;

        const handleScroll = () => {
            const headers = document.querySelectorAll('button[id^="step-"]');
            if (headers.length === 0) {
                console.log('No step headers found using CORRECT selectors');
                return;
            }

            headers.forEach((header, index) => {
                if (index >= stepIds.length) return;
                const rect = header.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;
                if (isVisible) {
                    const stepId = stepIds[index];
                    setActiveStepIds(prev => {
                        if (prev.has(stepId)) return prev;
                        // console.log(`Activating step ${stepId} from scroll`);
                        return new Set([...prev, stepId]);
                    });
                }
            });
        };

        const timeoutId = setTimeout(handleScroll, 500);
        window.addEventListener('scroll', handleScroll);
        const intervals = [1000, 2000, 3000].map(delay => setTimeout(handleScroll, delay));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
            intervals.forEach(id => clearTimeout(id));
        };
    }, [isExpandedMode, stepIds]);

    // Click handler (used within onClick prop below)
    const handleStepClick = (stepId: string) => {
        if (isExpandedMode) return;
        // console.log(`Clicked on step ${stepId}`);
        setActiveStepIds(prev => new Set([...prev, stepId]));
    };

    // Prepare children, passing down calculated state
    const enhancedChildren = childSteps.map((child, index) => {
        const childElement = child as React.ReactElement;
        const stepId = childElement.props.id || `step-${index + 1}`;
        const isActiveStep = activeStepIds.has(stepId); // Is this step activated by scroll/click?
        const isFirstStep = index === 0; // Is this the first step?

        return React.cloneElement(childElement, {
            key: stepId,
            id: stepId,
            isFirstStep, // Pass down flag for first step logic
            isActiveStep, // Pass down flag for active state logic
            forceExpanded: isExpandedMode ? 'true' : undefined // Pass down expanded mode
        });
    });

    // Filter out custom props before passing to underlying component
    const { expanded: _, ...domProps } = props;

    return (
        <OriginalVerticalStepper
            type={type}
            className={className}
            {...domProps}
            onClick={(e) => {
                if (isExpandedMode) return;
                const target = e.target as HTMLElement;
                const header = target.closest('button[id^="step-"]');
                if (header) {
                    const allHeaders = document.querySelectorAll('button[id^="step-"]');
                    const index = Array.from(allHeaders).indexOf(header as Element);
                    if (index !== -1 && index < stepIds.length) {
                        const stepId = stepIds[index];
                        handleStepClick(stepId);
                    }
                }
            }}
        >
            {enhancedChildren}
        </OriginalVerticalStepper>
    );
};

// Attach the Step component
VStepper.Step = Step;

// Export the main component
export default VStepper;
