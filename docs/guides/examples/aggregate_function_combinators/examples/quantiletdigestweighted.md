# quantileTDigestWeighted Combinator Examples

The following combinators can be applied to the `quantileTDigestWeighted` function:

### quantileTDigestWeightedIf
Calculates weighted quantile using the t-digest algorithm only for rows that match the given condition.

### quantileTDigestWeightedArray
Calculates weighted quantile using the t-digest algorithm from elements in the array.

### quantileTDigestWeightedMap
Calculates weighted quantile using the t-digest algorithm for each key in the map separately.

### quantileTDigestWeightedSimpleState
Returns the weighted t-digest state with SimpleAggregateFunction type.

### quantileTDigestWeightedState
Returns the intermediate state of weighted t-digest quantile calculation.

### quantileTDigestWeightedMerge
Combines intermediate states to get the final weighted quantile value.

### quantileTDigestWeightedMergeState
Combines intermediate states but returns an intermediate state.

### quantileTDigestWeightedForEach
Calculates weighted quantiles using the t-digest algorithm for corresponding elements in multiple arrays.

### quantileTDigestWeightedDistinct
Calculates weighted quantile using the t-digest algorithm using distinct values only.

### quantileTDigestWeightedOrDefault
Returns 0 if there are no rows.

### quantileTDigestWeightedOrNull
Returns NULL if there are no rows. 