# deltaSumTimestamp Combinator Examples

The following combinators can be applied to the `deltaSumTimestamp` function:

### deltaSumTimestampIf
Calculates sum of timestamp differences only for rows that match the given condition.

### deltaSumTimestampArray
Calculates sum of timestamp differences from elements in the array.

### deltaSumTimestampMap
Calculates sum of timestamp differences for each key in the map separately.

### deltaSumTimestampSimpleState
Returns the sum of timestamp differences state with SimpleAggregateFunction type.

### deltaSumTimestampState
Returns the intermediate state of sum of timestamp differences calculation.

### deltaSumTimestampMerge
Combines intermediate states to get the final sum of timestamp differences.

### deltaSumTimestampMergeState
Combines intermediate states but returns an intermediate state.

### deltaSumTimestampForEach
Calculates sum of timestamp differences for corresponding elements in multiple arrays.

### deltaSumTimestampDistinct
Calculates sum of timestamp differences using distinct values only.

### deltaSumTimestampOrDefault
Returns 0 if there are no rows.

### deltaSumTimestampOrNull
Returns NULL if there are no rows. 