# quantileExact Combinator Examples

The following combinators can be applied to the `quantileExact` function:

### quantileExactIf
Calculates the exact quantile only for rows that match the given condition.

### quantileExactArray
Calculates the exact quantile of elements in the array.

### quantileExactMap
Calculates the exact quantile for each key in the map separately.

### quantileExactSimpleState
Returns the exact quantile value with SimpleAggregateFunction type.

### quantileExactState
Returns the intermediate state of exact quantile calculation.

### quantileExactMerge
Combines intermediate states to get the final exact quantile.

### quantileExactMergeState
Combines intermediate states but returns an intermediate state.

### quantileExactForEach
Calculates the exact quantile for corresponding elements in multiple arrays.

### quantileExactDistinct
Calculates the exact quantile using distinct values only.

### quantileExactOrDefault
Returns 0 if there are not enough rows to calculate the exact quantile.

### quantileExactOrNull
Returns NULL if there are not enough rows to calculate the exact quantile. 