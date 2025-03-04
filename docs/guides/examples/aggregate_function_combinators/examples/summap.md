# sumMap Combinator Examples

The following combinators can be applied to the `sumMap` function:

### sumMapIf
Sums map values only for rows that match the given condition.

### sumMapArray
Sums map values from elements in the array.

### sumMapMap
Sums map values for each key in the outer map separately.

### sumMapSimpleState
Returns the summed map with SimpleAggregateFunction type.

### sumMapState
Returns the intermediate state of map summation calculation.

### sumMapMerge
Combines intermediate states to get the final summed map.

### sumMapMergeState
Combines intermediate states but returns an intermediate state.

### sumMapForEach
Sums map values for corresponding elements in multiple arrays.

### sumMapDistinct
Sums map values using distinct maps only.

### sumMapOrDefault
Returns an empty map if there are no rows.

### sumMapOrNull
Returns NULL if there are no rows. 