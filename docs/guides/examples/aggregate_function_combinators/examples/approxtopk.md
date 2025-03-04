# approxTopK Combinator Examples

The following combinators can be applied to the `approxTopK` function:

### approxTopKIf
Returns approximate top-K frequently occurring values only for rows that match the given condition.

### approxTopKArray
Returns approximate top-K frequently occurring values from elements in the array.

### approxTopKMap
Returns approximate top-K frequently occurring values for each key in the map separately.

### approxTopKSimpleState
Returns the approximate top-K state with SimpleAggregateFunction type.

### approxTopKState
Returns the intermediate state of approximate top-K calculation.

### approxTopKMerge
Combines intermediate states to get the final approximate top-K values.

### approxTopKMergeState
Combines intermediate states but returns an intermediate state.

### approxTopKForEach
Returns approximate top-K frequently occurring values for corresponding elements in multiple arrays.

### approxTopKDistinct
Returns approximate top-K frequently occurring values using distinct values only.

### approxTopKOrDefault
Returns empty array if there are no rows.

### approxTopKOrNull
Returns NULL if there are no rows. 