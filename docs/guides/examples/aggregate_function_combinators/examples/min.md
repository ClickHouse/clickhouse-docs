# min Combinator Examples

The following combinators can be applied to the `min` function:

### minIf
Calculates the minimum only for rows that match the given condition.

### minArray
Calculates the minimum among elements in the array.

### minMap
Calculates the minimum for each key in the map separately.

### minSimpleState
Returns the minimum value with SimpleAggregateFunction type.

### minState
Returns the intermediate state of minimum calculation.

### minMerge
Combines intermediate minimum states to get the final minimum.

### minMergeState
Combines intermediate minimum states but returns an intermediate state.

### minForEach
Calculates the minimum for corresponding elements in multiple arrays.

### minDistinct
Calculates the minimum among distinct values only.

### minOrDefault
Returns the default value for the input type if there are no rows to calculate minimum.

### minOrNull
Returns NULL if there are no rows to calculate minimum. 