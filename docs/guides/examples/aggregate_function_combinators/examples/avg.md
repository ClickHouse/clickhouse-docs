# avg Combinator Examples

The following combinators can be applied to the `avg` function:

### avgIf
Calculates the average only for rows that match the given condition.

### avgArray
Calculates the average of elements in the array.

### avgMap
Calculates the average for each key in the map separately.

### avgSimpleState
Returns the average value with SimpleAggregateFunction type.

### avgState
Returns the intermediate state of average calculation.

### avgMerge
Combines intermediate average states to get the final average.

### avgMergeState
Combines intermediate average states but returns an intermediate state.

### avgForEach
Calculates the average for corresponding elements in multiple arrays.

### avgDistinct
Calculates the average of distinct values only.

### avgOrDefault
Returns 0 if there are no rows to calculate average.

### avgOrNull
Returns NULL if there are no rows to calculate average. 