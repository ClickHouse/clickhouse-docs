# varPopStable Combinator Examples

The following combinators can be applied to the `varPopStable` function:

### varPopStableIf
Calculates population variance using numerically stable algorithm only for rows that match the given condition.

### varPopStableArray
Calculates population variance using numerically stable algorithm from elements in the array.

### varPopStableMap
Calculates population variance using numerically stable algorithm for each key in the map separately.

### varPopStableSimpleState
Returns the population variance state with SimpleAggregateFunction type.

### varPopStableState
Returns the intermediate state of population variance calculation.

### varPopStableMerge
Combines intermediate states to get the final population variance.

### varPopStableMergeState
Combines intermediate states but returns an intermediate state.

### varPopStableForEach
Calculates population variance using numerically stable algorithm for corresponding elements in multiple arrays.

### varPopStableDistinct
Calculates population variance using numerically stable algorithm using distinct values only.

### varPopStableOrDefault
Returns 0 if there are no rows.

### varPopStableOrNull
Returns NULL if there are no rows. 