# quantile Combinator Examples

The following combinators can be applied to the `quantile` function:

### quantileIf
Calculates the quantile only for rows that match the given condition.

### quantileArray
Calculates the quantile of elements in the array.

### quantileMap
Calculates the quantile for each key in the map separately.

### quantileSimpleState
Returns the quantile value with SimpleAggregateFunction type.

### quantileState
Returns the intermediate state of quantile calculation.

### quantileMerge
Combines intermediate states to get the final quantile.

### quantileMergeState
Combines intermediate states but returns an intermediate state.

### quantileForEach
Calculates the quantile for corresponding elements in multiple arrays.

### quantileDistinct
Calculates the quantile using distinct values only.

### quantileOrDefault
Returns 0 if there are not enough rows to calculate the quantile.

### quantileOrNull
Returns NULL if there are not enough rows to calculate the quantile. 