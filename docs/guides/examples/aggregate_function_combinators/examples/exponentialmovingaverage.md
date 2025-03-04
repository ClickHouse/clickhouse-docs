# exponentialMovingAverage Combinator Examples

The following combinators can be applied to the `exponentialMovingAverage` function:

### exponentialMovingAverageIf
Calculates exponential moving average only for rows that match the given condition.

### exponentialMovingAverageArray
Calculates exponential moving average from elements in the array.

### exponentialMovingAverageMap
Calculates exponential moving average for each key in the map separately.

### exponentialMovingAverageSimpleState
Returns the EMA state with SimpleAggregateFunction type.

### exponentialMovingAverageState
Returns the intermediate state of EMA calculation.

### exponentialMovingAverageMerge
Combines intermediate states to get the final EMA value.

### exponentialMovingAverageMergeState
Combines intermediate states but returns an intermediate state.

### exponentialMovingAverageForEach
Calculates exponential moving average for corresponding elements in multiple arrays.

### exponentialMovingAverageDistinct
Calculates exponential moving average using distinct values only.

### exponentialMovingAverageOrDefault
Returns 0 if there are no rows.

### exponentialMovingAverageOrNull
Returns NULL if there are no rows. 