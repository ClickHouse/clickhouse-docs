# topK Combinator Examples

The following combinators can be applied to the `topK` function:

### topKIf
Returns array of most frequent values only for rows that match the given condition.

### topKArray
Returns array of most frequent values from elements in the array.

### topKMap
Returns array of most frequent values for each key in the map separately.

### topKSimpleState
Returns the top-K state with SimpleAggregateFunction type.

### topKState
Returns the intermediate state of top-K calculation.

### topKMerge
Combines intermediate states to get the final array of most frequent values.

### topKMergeState
Combines intermediate states but returns an intermediate state.

### topKForEach
Returns array of most frequent values for corresponding elements in multiple arrays.

### topKDistinct
Returns array of most frequent distinct values.

### topKOrDefault
Returns an empty array if there are no rows.

### topKOrNull
Returns NULL if there are no rows. 