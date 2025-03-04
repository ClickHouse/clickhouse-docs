# exponentialTimeDecayedMax Combinator Examples

The following combinators can be applied to the `exponentialTimeDecayedMax` function:

### exponentialTimeDecayedMaxIf
Calculates time-decayed maximum with exponential decay only for rows that match the given condition.

### exponentialTimeDecayedMaxArray
Calculates time-decayed maximum with exponential decay from elements in the array.

### exponentialTimeDecayedMaxMap
Calculates time-decayed maximum with exponential decay for each key in the map separately.

### exponentialTimeDecayedMaxSimpleState
Returns the time-decayed maximum state with SimpleAggregateFunction type.

### exponentialTimeDecayedMaxState
Returns the intermediate state of time-decayed maximum calculation.

### exponentialTimeDecayedMaxMerge
Combines intermediate states to get the final time-decayed maximum value.

### exponentialTimeDecayedMaxMergeState
Combines intermediate states but returns an intermediate state.

### exponentialTimeDecayedMaxForEach
Calculates time-decayed maximums with exponential decay for corresponding elements in multiple arrays.

### exponentialTimeDecayedMaxDistinct
Calculates time-decayed maximum with exponential decay using distinct values only.

### exponentialTimeDecayedMaxOrDefault
Returns 0 if there are no rows.

### exponentialTimeDecayedMaxOrNull
Returns NULL if there are no rows. 