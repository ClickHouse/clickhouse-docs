# quantileDeterministic Combinator Examples

The following combinators can be applied to the `quantileDeterministic` function:

### quantileDeterministicIf
Calculates deterministic quantile only for rows that match the given condition.

### quantileDeterministicArray
Calculates deterministic quantile from elements in the array.

### quantileDeterministicMap
Calculates deterministic quantile for each key in the map separately.

### quantileDeterministicSimpleState
Returns the deterministic quantile state with SimpleAggregateFunction type.

### quantileDeterministicState
Returns the intermediate state of deterministic quantile calculation.

### quantileDeterministicMerge
Combines intermediate states to get the final quantile value.

### quantileDeterministicMergeState
Combines intermediate states but returns an intermediate state.

### quantileDeterministicForEach
Calculates deterministic quantiles for corresponding elements in multiple arrays.

### quantileDeterministicDistinct
Calculates deterministic quantile using distinct values only.

### quantileDeterministicOrDefault
Returns 0 if there are no rows.

### quantileDeterministicOrNull
Returns NULL if there are no rows. 