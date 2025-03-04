# windowFunnel Combinator Examples

The following combinators can be applied to the `windowFunnel` function:

### windowFunnelIf
Calculates event funnel statistics only for rows that match the given condition.

### windowFunnelArray
Calculates event funnel statistics from elements in the array.

### windowFunnelMap
Calculates event funnel statistics for each key in the map separately.

### windowFunnelSimpleState
Returns the funnel state with SimpleAggregateFunction type.

### windowFunnelState
Returns the intermediate state of funnel calculation.

### windowFunnelMerge
Combines intermediate states to get the final funnel statistics.

### windowFunnelMergeState
Combines intermediate states but returns an intermediate state.

### windowFunnelForEach
Calculates event funnel statistics for corresponding elements in multiple arrays.

### windowFunnelDistinct
Calculates event funnel statistics using distinct events only.

### windowFunnelOrDefault
Returns 0 if there are no rows.

### windowFunnelOrNull
Returns NULL if there are no rows. 