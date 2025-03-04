# quantileExactWeighted Combinator Examples

The following combinators can be applied to the `quantileExactWeighted` function:

### quantileExactWeightedIf
Calculates the exact weighted quantile only for rows that match the given condition.

### quantileExactWeightedArray
Calculates the exact weighted quantile of elements in the array.

### quantileExactWeightedMap
Calculates the exact weighted quantile for each key in the map separately.

### quantileExactWeightedSimpleState
Returns the exact weighted quantile value with SimpleAggregateFunction type.

### quantileExactWeightedState
Returns the intermediate state of exact weighted quantile calculation.

### quantileExactWeightedMerge
Combines intermediate states to get the final exact weighted quantile.

### quantileExactWeightedMergeState
Combines intermediate states but returns an intermediate state.

### quantileExactWeightedForEach
Calculates the exact weighted quantile for corresponding elements in multiple arrays.

### quantileExactWeightedDistinct
Calculates the exact weighted quantile using distinct values only.

### quantileExactWeightedOrDefault
Returns 0 if there are not enough rows to calculate the exact weighted quantile.

### quantileExactWeightedOrNull
Returns NULL if there are not enough rows to calculate the exact weighted quantile. 