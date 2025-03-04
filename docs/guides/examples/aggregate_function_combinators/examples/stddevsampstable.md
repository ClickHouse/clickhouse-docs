# stddevSampStable Combinator Examples

The following combinators can be applied to the `stddevSampStable` function:

### stddevSampStableIf
Calculates sample standard deviation using numerically stable algorithm only for rows that match the given condition.

### stddevSampStableArray
Calculates sample standard deviation using numerically stable algorithm from elements in the array.

### stddevSampStableMap
Calculates sample standard deviation using numerically stable algorithm for each key in the map separately.

### stddevSampStableSimpleState
Returns the sample standard deviation state with SimpleAggregateFunction type.

### stddevSampStableState
Returns the intermediate state of sample standard deviation calculation.

### stddevSampStableMerge
Combines intermediate states to get the final sample standard deviation.

### stddevSampStableMergeState
Combines intermediate states but returns an intermediate state.

### stddevSampStableForEach
Calculates sample standard deviation using numerically stable algorithm for corresponding elements in multiple arrays.

### stddevSampStableDistinct
Calculates sample standard deviation using numerically stable algorithm using distinct values only.

### stddevSampStableOrDefault
Returns 0 if there are no rows.

### stddevSampStableOrNull
Returns NULL if there are no rows. 