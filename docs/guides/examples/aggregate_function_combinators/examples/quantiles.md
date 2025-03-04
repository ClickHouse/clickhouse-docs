# quantiles Combinator Examples

The following combinators can be applied to the `quantiles` function:

### quantilesIf
Calculates multiple quantiles only for rows that match the given condition.

### quantilesArray
Calculates multiple quantiles from elements in the array.

### quantilesMap
Calculates multiple quantiles for each key in the map separately.

### quantilesSimpleState
Returns the quantiles state with SimpleAggregateFunction type.

### quantilesState
Returns the intermediate state of quantiles calculation.

### quantilesMerge
Combines intermediate states to get the final quantile values.

### quantilesMergeState
Combines intermediate states but returns an intermediate state.

### quantilesForEach
Calculates multiple quantiles for corresponding elements in multiple arrays.

### quantilesDistinct
Calculates multiple quantiles using distinct values only.

### quantilesOrDefault
Returns an array of zeros if there are no rows.

### quantilesOrNull
Returns NULL if there are no rows. 