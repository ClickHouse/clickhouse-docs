# exponentialTimeDecayedCount Combinator Examples

The following combinators can be applied to the `exponentialTimeDecayedCount` function:

### exponentialTimeDecayedCountIf
Calculates time-decayed count with exponential decay only for rows that match the given condition.

### exponentialTimeDecayedCountArray
Calculates time-decayed count with exponential decay from elements in the array.

### exponentialTimeDecayedCountMap
Calculates time-decayed count with exponential decay for each key in the map separately.

### exponentialTimeDecayedCountSimpleState
Returns the time-decayed count state with SimpleAggregateFunction type.

### exponentialTimeDecayedCountState
Returns the intermediate state of time-decayed count calculation.

### exponentialTimeDecayedCountMerge
Combines intermediate states to get the final time-decayed count value.

### exponentialTimeDecayedCountMergeState
Combines intermediate states but returns an intermediate state.

### exponentialTimeDecayedCountForEach
Calculates time-decayed counts with exponential decay for corresponding elements in multiple arrays.

### exponentialTimeDecayedCountDistinct
Calculates time-decayed count with exponential decay using distinct values only.

### exponentialTimeDecayedCountOrDefault
Returns 0 if there are no rows.

### exponentialTimeDecayedCountOrNull
Returns NULL if there are no rows. 