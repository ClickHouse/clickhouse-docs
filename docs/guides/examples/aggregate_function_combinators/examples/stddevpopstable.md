# stddevPopStable Combinator Examples

The following combinators can be applied to the `stddevPopStable` function:

### stddevPopStableIf
Calculates population standard deviation using numerically stable algorithm only for rows that match the given condition.

### stddevPopStableArray
Calculates population standard deviation using numerically stable algorithm from elements in the array.

### stddevPopStableMap
Calculates population standard deviation using numerically stable algorithm for each key in the map separately.

### stddevPopStableSimpleState
Returns the population standard deviation state with SimpleAggregateFunction type.

### stddevPopStableState
Returns the intermediate state of population standard deviation calculation.

### stddevPopStableMerge
Combines intermediate states to get the final population standard deviation.

### stddevPopStableMergeState
Combines intermediate states but returns an intermediate state.

### stddevPopStableForEach
Calculates population standard deviation using numerically stable algorithm for corresponding elements in multiple arrays.

### stddevPopStableDistinct
Calculates population standard deviation using numerically stable algorithm using distinct values only.

### stddevPopStableOrDefault
Returns 0 if there are no rows.

### stddevPopStableOrNull
Returns NULL if there are no rows. 