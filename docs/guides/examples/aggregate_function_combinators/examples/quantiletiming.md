# quantileTiming Combinator Examples

The following combinators can be applied to the `quantileTiming` function:

### quantileTimingIf
Calculates the timing quantile only for rows that match the given condition.

### quantileTimingArray
Calculates the timing quantile of elements in the array.

### quantileTimingMap
Calculates the timing quantile for each key in the map separately.

### quantileTimingSimpleState
Returns the timing quantile value with SimpleAggregateFunction type.

### quantileTimingState
Returns the intermediate state of timing quantile calculation.

### quantileTimingMerge
Combines intermediate states to get the final timing quantile.

### quantileTimingMergeState
Combines intermediate states but returns an intermediate state.

### quantileTimingForEach
Calculates the timing quantile for corresponding elements in multiple arrays.

### quantileTimingDistinct
Calculates the timing quantile using distinct values only.

### quantileTimingOrDefault
Returns 0 if there are not enough rows to calculate the timing quantile.

### quantileTimingOrNull
Returns NULL if there are not enough rows to calculate the timing quantile. 