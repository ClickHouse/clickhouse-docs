# quantileInterpolatedWeighted Combinator Examples

The following combinators can be applied to the `quantileInterpolatedWeighted` function:

### quantileInterpolatedWeightedIf
Calculates the interpolated weighted quantile only for rows that match the given condition.

### quantileInterpolatedWeightedArray
Calculates the interpolated weighted quantile of elements in the array.

### quantileInterpolatedWeightedMap
Calculates the interpolated weighted quantile for each key in the map separately.

### quantileInterpolatedWeightedSimpleState
Returns the interpolated weighted quantile value with SimpleAggregateFunction type.

### quantileInterpolatedWeightedState
Returns the intermediate state of interpolated weighted quantile calculation.

### quantileInterpolatedWeightedMerge
Combines intermediate states to get the final interpolated weighted quantile.

### quantileInterpolatedWeightedMergeState
Combines intermediate states but returns an intermediate state.

### quantileInterpolatedWeightedForEach
Calculates the interpolated weighted quantile for corresponding elements in multiple arrays.

### quantileInterpolatedWeightedDistinct
Calculates the interpolated weighted quantile using distinct values only.

### quantileInterpolatedWeightedOrDefault
Returns 0 if there are not enough rows to calculate the interpolated weighted quantile.

### quantileInterpolatedWeightedOrNull
Returns NULL if there are not enough rows to calculate the interpolated weighted quantile. 