# varpop Combinator Examples

The following combinators can be applied to the `varpop` function:

### varpopIf
Calculates population variance only for rows that match the given condition.

### varpopArray
Calculates population variance of elements in the array.

### varpopMap
Calculates population variance for each key in the map separately.

### varpopSimpleState
Returns the variance value with SimpleAggregateFunction type.

### varpopState
Returns the intermediate state of variance calculation.

### varpopMerge
Combines intermediate states to get the final variance.

### varpopMergeState
Combines intermediate states but returns an intermediate state.

### varpopForEach
Calculates population variance for corresponding elements in multiple arrays.

### varpopDistinct
Calculates population variance of distinct values only.

### varpopOrDefault
Returns 0 if there are not enough rows to calculate variance.

### varpopOrNull
Returns NULL if there are not enough rows to calculate variance. 