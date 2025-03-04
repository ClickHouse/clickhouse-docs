# intervalLengthSum Combinator Examples

The following combinators can be applied to the `intervalLengthSum` function:

### intervalLengthSumIf
Calculates sum of interval lengths only for rows that match the given condition.

### intervalLengthSumArray
Calculates sum of interval lengths from elements in the array.

### intervalLengthSumMap
Calculates sum of interval lengths for each key in the map separately.

### intervalLengthSumSimpleState
Returns the interval length sum state with SimpleAggregateFunction type.

### intervalLengthSumState
Returns the intermediate state of interval length sum calculation.

### intervalLengthSumMerge
Combines intermediate states to get the final interval length sum.

### intervalLengthSumMergeState
Combines intermediate states but returns an intermediate state.

### intervalLengthSumForEach
Calculates sum of interval lengths for corresponding elements in multiple arrays.

### intervalLengthSumDistinct
Calculates sum of interval lengths using distinct intervals only.

### intervalLengthSumOrDefault
Returns 0 if there are no rows.

### intervalLengthSumOrNull
Returns NULL if there are no rows. 