# uniq Combinator Examples

The following combinators can be applied to the `uniq` function:

### uniqIf
Counts distinct values only for rows that match the given condition.

### uniqArray
Counts distinct values in array elements.

### uniqMap
Counts distinct values for each key in the map separately.

### uniqSimpleState
Returns the state with SimpleAggregateFunction type.

### uniqState
Returns the intermediate state of distinct values calculation.

### uniqMerge
Combines intermediate states to get the final distinct count.

### uniqMergeState
Combines intermediate states but returns an intermediate state.

### uniqForEach
Counts distinct values for corresponding elements in multiple arrays.

### uniqDistinct
Same as regular uniq (already counts distinct values).

### uniqOrDefault
Returns 0 if there are no rows to count distinct values.

### uniqOrNull
Returns NULL if there are no rows to count distinct values. 