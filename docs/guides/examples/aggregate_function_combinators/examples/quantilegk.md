# quantileGK Combinator Examples

The following combinators can be applied to the `quantileGK` function:

### quantileGKIf
Calculates quantile using the Greenwald-Khanna algorithm only for rows that match the given condition.

### quantileGKArray
Calculates quantile using the Greenwald-Khanna algorithm from elements in the array.

### quantileGKMap
Calculates quantile using the Greenwald-Khanna algorithm for each key in the map separately.

### quantileGKSimpleState
Returns the Greenwald-Khanna state with SimpleAggregateFunction type.

### quantileGKState
Returns the intermediate state of Greenwald-Khanna quantile calculation.

### quantileGKMerge
Combines intermediate states to get the final quantile value.

### quantileGKMergeState
Combines intermediate states but returns an intermediate state.

### quantileGKForEach
Calculates quantiles using the Greenwald-Khanna algorithm for corresponding elements in multiple arrays.

### quantileGKDistinct
Calculates quantile using the Greenwald-Khanna algorithm using distinct values only.

### quantileGKOrDefault
Returns 0 if there are no rows.

### quantileGKOrNull
Returns NULL if there are no rows. 