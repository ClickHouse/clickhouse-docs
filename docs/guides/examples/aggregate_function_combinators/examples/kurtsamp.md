# kurtSamp Combinator Examples

The following combinators can be applied to the `kurtSamp` function:

### kurtSampIf
Calculates sample kurtosis only for rows that match the given condition.

### kurtSampArray
Calculates sample kurtosis from elements in the array.

### kurtSampMap
Calculates sample kurtosis for each key in the map separately.

### kurtSampSimpleState
Returns the sample kurtosis state with SimpleAggregateFunction type.

### kurtSampState
Returns the intermediate state of sample kurtosis calculation.

### kurtSampMerge
Combines intermediate states to get the final sample kurtosis.

### kurtSampMergeState
Combines intermediate states but returns an intermediate state.

### kurtSampForEach
Calculates sample kurtosis for corresponding elements in multiple arrays.

### kurtSampDistinct
Calculates sample kurtosis using distinct values only.

### kurtSampOrDefault
Returns 0 if there are no rows.

### kurtSampOrNull
Returns NULL if there are no rows. 