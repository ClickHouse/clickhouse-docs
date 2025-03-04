# kurtPop Combinator Examples

The following combinators can be applied to the `kurtPop` function:

### kurtPopIf
Calculates population kurtosis only for rows that match the given condition.

### kurtPopArray
Calculates population kurtosis from elements in the array.

### kurtPopMap
Calculates population kurtosis for each key in the map separately.

### kurtPopSimpleState
Returns the kurtosis state with SimpleAggregateFunction type.

### kurtPopState
Returns the intermediate state of kurtosis calculation.

### kurtPopMerge
Combines intermediate states to get the final kurtosis value.

### kurtPopMergeState
Combines intermediate states but returns an intermediate state.

### kurtPopForEach
Calculates population kurtosis for corresponding elements in multiple arrays.

### kurtPopDistinct
Calculates population kurtosis using distinct values only.

### kurtPopOrDefault
Returns 0 if there are no rows.

### kurtPopOrNull
Returns NULL if there are no rows. 