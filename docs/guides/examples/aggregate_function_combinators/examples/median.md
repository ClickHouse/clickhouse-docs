# median Combinator Examples

The following combinators can be applied to the `median` function:

### medianIf
Calculates the median only for rows that match the given condition.

### medianArray
Calculates the median of elements in the array.

### medianMap
Calculates the median for each key in the map separately.

### medianSimpleState
Returns the median value with SimpleAggregateFunction type.

### medianState
Returns the intermediate state of median calculation.

### medianMerge
Combines intermediate median states to get the final median.

### medianMergeState
Combines intermediate median states but returns an intermediate state.

### medianForEach
Calculates the median for corresponding elements in multiple arrays.

### medianDistinct
Calculates the median of distinct values only.

### medianOrDefault
Returns 0 if there are no rows to calculate median.

### medianOrNull
Returns NULL if there are no rows to calculate median. 