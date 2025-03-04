# sumMapWithOverflow Combinator Examples

The following combinators can be applied to the `sumMapWithOverflow` function:

### sumMapWithOverflowIf
Sums map values with overflow checking only for rows that match the given condition.

### sumMapWithOverflowArray
Sums map values with overflow checking from elements in the array.

### sumMapWithOverflowMap
Sums map values with overflow checking for each key in the outer map separately.

### sumMapWithOverflowSimpleState
Returns the summed map with overflow checking with SimpleAggregateFunction type.

### sumMapWithOverflowState
Returns the intermediate state of map summation with overflow checking calculation.

### sumMapWithOverflowMerge
Combines intermediate states to get the final summed map with overflow checking.

### sumMapWithOverflowMergeState
Combines intermediate states but returns an intermediate state.

### sumMapWithOverflowForEach
Sums map values with overflow checking for corresponding elements in multiple arrays.

### sumMapWithOverflowDistinct
Sums map values with overflow checking using distinct maps only.

### sumMapWithOverflowOrDefault
Returns an empty map if there are no rows.

### sumMapWithOverflowOrNull
Returns NULL if there are no rows. 