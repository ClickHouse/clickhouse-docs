# sumWithOverflow Combinator Examples

The following combinators can be applied to the `sumWithOverflow` function:

### sumWithOverflowIf
Calculates sum with overflow checking only for rows that match the given condition.

### sumWithOverflowArray
Calculates sum with overflow checking of elements in the array.

### sumWithOverflowMap
Calculates sum with overflow checking for each key in the map separately.

### sumWithOverflowSimpleState
Returns the sum with overflow checking with SimpleAggregateFunction type.

### sumWithOverflowState
Returns the intermediate state of sum with overflow checking calculation.

### sumWithOverflowMerge
Combines intermediate states to get the final sum with overflow checking.

### sumWithOverflowMergeState
Combines intermediate states but returns an intermediate state.

### sumWithOverflowForEach
Calculates sum with overflow checking for corresponding elements in multiple arrays.

### sumWithOverflowDistinct
Calculates sum with overflow checking using distinct values only.

### sumWithOverflowOrDefault
Returns 0 if there are no rows to sum.

### sumWithOverflowOrNull
Returns NULL if there are no rows to sum. 