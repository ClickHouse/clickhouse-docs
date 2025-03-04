# approxTopSumAvgWeighted Combinator Examples

The following combinators can be applied to the `approxTopSumAvgWeighted` function:

### approxTopSumAvgWeightedIf
Calculates weighted sum and average for approximate top K elements only for rows that match the given condition.

### approxTopSumAvgWeightedArray
Calculates weighted sum and average for approximate top K elements from elements in the array.

### approxTopSumAvgWeightedMap
Calculates weighted sum and average for approximate top K elements for each key in the map separately.

### approxTopSumAvgWeightedSimpleState
Returns the approximate top K state with SimpleAggregateFunction type.

### approxTopSumAvgWeightedState
Returns the intermediate state of approximate top K calculation.

### approxTopSumAvgWeightedMerge
Combines intermediate states to get the final approximate top K results.

### approxTopSumAvgWeightedMergeState
Combines intermediate states but returns an intermediate state.

### approxTopSumAvgWeightedForEach
Calculates weighted sum and average for approximate top K elements for corresponding elements in multiple arrays.

### approxTopSumAvgWeightedDistinct
Calculates weighted sum and average for approximate top K elements using distinct values only.

### approxTopSumAvgWeightedOrDefault
Returns an empty result if there are no rows.

### approxTopSumAvgWeightedOrNull
Returns NULL if there are no rows. 