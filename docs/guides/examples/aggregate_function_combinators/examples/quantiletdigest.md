# quantileTDigest Combinator Examples

The following combinators can be applied to the `quantileTDigest` function:

### quantileTDigestIf
Calculates quantile using the t-digest algorithm only for rows that match the given condition.

### quantileTDigestArray
Calculates quantile using the t-digest algorithm from elements in the array.

### quantileTDigestMap
Calculates quantile using the t-digest algorithm for each key in the map separately.

### quantileTDigestSimpleState
Returns the t-digest state with SimpleAggregateFunction type.

### quantileTDigestState
Returns the intermediate state of t-digest quantile calculation.

### quantileTDigestMerge
Combines intermediate states to get the final quantile value.

### quantileTDigestMergeState
Combines intermediate states but returns an intermediate state.

### quantileTDigestForEach
Calculates quantiles using the t-digest algorithm for corresponding elements in multiple arrays.

### quantileTDigestDistinct
Calculates quantile using the t-digest algorithm using distinct values only.

### quantileTDigestOrDefault
Returns 0 if there are no rows.

### quantileTDigestOrNull
Returns NULL if there are no rows. 