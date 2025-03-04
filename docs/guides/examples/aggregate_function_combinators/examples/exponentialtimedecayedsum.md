# exponentialTimeDecayedSum Combinator Examples

The following combinators can be applied to the `exponentialTimeDecayedSum` function:

### exponentialTimeDecayedSumIf
Calculates time-decayed sum with exponential decay only for rows that match the given condition.

### exponentialTimeDecayedSumArray
Calculates time-decayed sum with exponential decay from elements in the array.

### exponentialTimeDecayedSumMap
Calculates time-decayed sum with exponential decay for each key in the map separately.

### exponentialTimeDecayedSumSimpleState
Returns the time-decayed sum state with SimpleAggregateFunction type.

### exponentialTimeDecayedSumState
Returns the intermediate state of time-decayed sum calculation.

### exponentialTimeDecayedSumMerge
Combines intermediate states to get the final time-decayed sum value.

### exponentialTimeDecayedSumMergeState
Combines intermediate states but returns an intermediate state.

### exponentialTimeDecayedSumForEach
Calculates time-decayed sums with exponential decay for corresponding elements in multiple arrays.

### exponentialTimeDecayedSumDistinct
Calculates time-decayed sum with exponential decay using distinct values only.

### exponentialTimeDecayedSumOrDefault
Returns 0 if there are no rows.

### exponentialTimeDecayedSumOrNull
Returns NULL if there are no rows. 