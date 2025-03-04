# quantileTimingWeighted Combinator Examples

The following combinators can be applied to the `quantileTimingWeighted` function:

### quantileTimingWeightedIf
Calculates weighted timing quantile only for rows that match the given condition.

### quantileTimingWeightedArray
Calculates weighted timing quantile from elements in the array.

### quantileTimingWeightedMap
Calculates weighted timing quantile for each key in the map separately.

### quantileTimingWeightedSimpleState
Returns the weighted timing quantile state with SimpleAggregateFunction type.

### quantileTimingWeightedState
Returns the intermediate state of weighted timing quantile calculation.

### quantileTimingWeightedMerge
Combines intermediate states to get the final weighted timing quantile.

### quantileTimingWeightedMergeState
Combines intermediate states but returns an intermediate state.

### quantileTimingWeightedForEach
Calculates weighted timing quantile for corresponding elements in multiple arrays.

### quantileTimingWeightedDistinct
Calculates weighted timing quantile using distinct values only.

### quantileTimingWeightedOrDefault
Returns 0 if there are no rows.

### quantileTimingWeightedOrNull
Returns NULL if there are no rows. 