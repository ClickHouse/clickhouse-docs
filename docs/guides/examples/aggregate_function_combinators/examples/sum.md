# sum Combinator Examples

The following combinators can be applied to the `sum` function:

### sumIf
Calculates the sum only for rows that match the given condition.

### sumArray
Calculates the sum of elements in the array.

### sumMap
Calculates the sum for each key in the map separately.

### sumSimpleState
Returns the sum value with SimpleAggregateFunction type.

### sumState
Returns the intermediate state of sum calculation.

### sumMerge
Combines intermediate sum states to get the final sum.

### sumMergeState
Combines intermediate sum states but returns an intermediate state.

### sumForEach
Calculates the sum for corresponding elements in multiple arrays.

### sumDistinct
Calculates the sum of distinct values only.

### sumOrDefault
Returns 0 if there are no rows to calculate sum.

### sumOrNull
Returns NULL if there are no rows to calculate sum. 