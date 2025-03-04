# sumCount Combinator Examples

The following combinators can be applied to the `sumCount` function:

### sumCountIf
Returns tuple of sum and count only for rows that match the given condition.

### sumCountArray
Returns tuple of sum and count from elements in the array.

### sumCountMap
Returns tuple of sum and count for each key in the map separately.

### sumCountSimpleState
Returns the sum and count state with SimpleAggregateFunction type.

### sumCountState
Returns the intermediate state of sum and count calculation.

### sumCountMerge
Combines intermediate states to get the final tuple of sum and count.

### sumCountMergeState
Combines intermediate states but returns an intermediate state.

### sumCountForEach
Returns tuple of sum and count for corresponding elements in multiple arrays.

### sumCountDistinct
Returns tuple of sum and count using distinct values only.

### sumCountOrDefault
Returns (0, 0) if there are no rows.

### sumCountOrNull
Returns NULL if there are no rows. 