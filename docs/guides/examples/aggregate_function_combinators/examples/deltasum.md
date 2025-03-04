# deltaSum Combinator Examples

The following combinators can be applied to the `deltaSum` function:

### deltaSumIf
Calculates sum of differences only for rows that match the given condition.

### deltaSumArray
Calculates sum of differences from elements in the array.

### deltaSumMap
Calculates sum of differences for each key in the map separately.

### deltaSumSimpleState
Returns the sum of differences state with SimpleAggregateFunction type.

### deltaSumState
Returns the intermediate state of sum of differences calculation.

### deltaSumMerge
Combines intermediate states to get the final sum of differences.

### deltaSumMergeState
Combines intermediate states but returns an intermediate state.

### deltaSumForEach
Calculates sum of differences for corresponding elements in multiple arrays.

### deltaSumDistinct
Calculates sum of differences using distinct values only.

### deltaSumOrDefault
Returns 0 if there are no rows.

### deltaSumOrNull
Returns NULL if there are no rows. 