# exponentialTimeDecayedAvg Combinator Examples

The following combinators can be applied to the `exponentialTimeDecayedAvg` function:

### exponentialTimeDecayedAvgIf
Calculates time-decayed average with exponential decay only for rows that match the given condition.

### exponentialTimeDecayedAvgArray
Calculates time-decayed average with exponential decay from elements in the array.

### exponentialTimeDecayedAvgMap
Calculates time-decayed average with exponential decay for each key in the map separately.

### exponentialTimeDecayedAvgSimpleState
Returns the time-decayed average state with SimpleAggregateFunction type.

### exponentialTimeDecayedAvgState
Returns the intermediate state of time-decayed average calculation.

### exponentialTimeDecayedAvgMerge
Combines intermediate states to get the final time-decayed average value.

### exponentialTimeDecayedAvgMergeState
Combines intermediate states but returns an intermediate state.

### exponentialTimeDecayedAvgForEach
Calculates time-decayed averages with exponential decay for corresponding elements in multiple arrays.

### exponentialTimeDecayedAvgDistinct
Calculates time-decayed average with exponential decay using distinct values only.

### exponentialTimeDecayedAvgOrDefault
Returns 0 if there are no rows.

### exponentialTimeDecayedAvgOrNull
Returns NULL if there are no rows. 