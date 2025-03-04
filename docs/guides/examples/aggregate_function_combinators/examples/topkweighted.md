# topKWeighted Combinator Examples

The following combinators can be applied to the `topKWeighted` function:

### topKWeightedIf
Returns array of most frequent values by weight only for rows that match the given condition.

### topKWeightedArray
Returns array of most frequent values by weight from elements in the array.

### topKWeightedMap
Returns array of most frequent values by weight for each key in the map separately.

### topKWeightedSimpleState
Returns the weighted top-K state with SimpleAggregateFunction type.

### topKWeightedState
Returns the intermediate state of weighted top-K calculation.

### topKWeightedMerge
Combines intermediate states to get the final array of most frequent values by weight.

### topKWeightedMergeState
Combines intermediate states but returns an intermediate state.

### topKWeightedForEach
Returns array of most frequent values by weight for corresponding elements in multiple arrays.

### topKWeightedDistinct
Returns array of most frequent distinct values by weight.

### topKWeightedOrDefault
Returns an empty array if there are no rows.

### topKWeightedOrNull
Returns NULL if there are no rows. 