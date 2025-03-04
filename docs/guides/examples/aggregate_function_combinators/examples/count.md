# count Combinator Examples

The following combinators can be applied to the `count` function:

### countIf
Counts the number of rows that match the given condition.

### countArray
Counts the number of elements in the array.

### countMap
Counts the number of elements for each key in the map separately.

### countSimpleState
Returns the count value with SimpleAggregateFunction type.

### countState
Returns the intermediate state of count calculation.

### countMerge
Combines intermediate count states to get the final count.

### countMergeState
Combines intermediate count states but returns an intermediate state.

### countForEach
Counts elements for corresponding positions in multiple arrays.

### countDistinct
Counts the number of distinct values (same as COUNT(DISTINCT ...)).

### countOrDefault
Returns 0 if there are no rows to count.

### countOrNull
Returns NULL if there are no rows to count. 