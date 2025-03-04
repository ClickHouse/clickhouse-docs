# skewPop Combinator Examples

The following combinators can be applied to the `skewPop` function:

### skewPopIf
Calculates population skewness only for rows that match the given condition.

### skewPopArray
Calculates population skewness from elements in the array.

### skewPopMap
Calculates population skewness for each key in the map separately.

### skewPopSimpleState
Returns the skewness state with SimpleAggregateFunction type.

### skewPopState
Returns the intermediate state of skewness calculation.

### skewPopMerge
Combines intermediate states to get the final skewness value.

### skewPopMergeState
Combines intermediate states but returns an intermediate state.

### skewPopForEach
Calculates population skewness for corresponding elements in multiple arrays.

### skewPopDistinct
Calculates population skewness using distinct values only.

### skewPopOrDefault
Returns 0 if there are no rows.

### skewPopOrNull
Returns NULL if there are no rows. 