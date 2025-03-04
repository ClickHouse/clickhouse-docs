# groupArrayMovingAvg Combinator Examples

The following combinators can be applied to the `groupArrayMovingAvg` function:

### groupArrayMovingAvgIf
Calculates moving averages only for rows that match the given condition.

### groupArrayMovingAvgArray
Calculates moving averages of elements in the array.

### groupArrayMovingAvgMap
Calculates moving averages for each key in the map separately.

### groupArrayMovingAvgSimpleState
Returns the moving averages with SimpleAggregateFunction type.

### groupArrayMovingAvgState
Returns the intermediate state of moving average calculation.

### groupArrayMovingAvgMerge
Combines intermediate states to get the final moving averages.

### groupArrayMovingAvgMergeState
Combines intermediate states but returns an intermediate state.

### groupArrayMovingAvgForEach
Calculates moving averages for corresponding elements in multiple arrays.

### groupArrayMovingAvgDistinct
Calculates moving averages using distinct values only.

### groupArrayMovingAvgOrDefault
Returns an array of zeros if there are not enough rows.

### groupArrayMovingAvgOrNull
Returns NULL if there are not enough rows. 