# quantileExactWeightedInterpolated Combinator Examples

The following combinators can be applied to the `quantileExactWeightedInterpolated` function:

### quantileExactWeightedInterpolatedIf
Calculates exact weighted interpolated quantile only for rows that match the given condition.

### quantileExactWeightedInterpolatedArray
Calculates exact weighted interpolated quantile from elements in the array.

### quantileExactWeightedInterpolatedMap
Calculates exact weighted interpolated quantile for each key in the map separately.

### quantileExactWeightedInterpolatedSimpleState
Returns the exact weighted interpolated quantile state with SimpleAggregateFunction type.

### quantileExactWeightedInterpolatedState
Returns the intermediate state of exact weighted interpolated quantile calculation.

### quantileExactWeightedInterpolatedMerge
Combines intermediate states to get the final exact weighted interpolated quantile.

### quantileExactWeightedInterpolatedMergeState
Combines intermediate states but returns an intermediate state.

### quantileExactWeightedInterpolatedForEach
Calculates exact weighted interpolated quantile for corresponding elements in multiple arrays.

### quantileExactWeightedInterpolatedDistinct
Calculates exact weighted interpolated quantile using distinct values only.

### quantileExactWeightedInterpolatedOrDefault
Returns 0 if there are no rows.

### quantileExactWeightedInterpolatedOrNull
Returns NULL if there are no rows. 