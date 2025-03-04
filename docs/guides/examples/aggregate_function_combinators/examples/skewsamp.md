# skewSamp Combinator Examples

The following combinators can be applied to the `skewSamp` function:

### skewSampIf
Calculates sample skewness only for rows that match the given condition.

### skewSampArray
Calculates sample skewness from elements in the array.

### skewSampMap
Calculates sample skewness for each key in the map separately.

### skewSampSimpleState
Returns the sample skewness state with SimpleAggregateFunction type.

### skewSampState
Returns the intermediate state of sample skewness calculation.

### skewSampMerge
Combines intermediate states to get the final sample skewness.

### skewSampMergeState
Combines intermediate states but returns an intermediate state.

### skewSampForEach
Calculates sample skewness for corresponding elements in multiple arrays.

### skewSampDistinct
Calculates sample skewness using distinct values only.

### skewSampOrDefault
Returns 0 if there are no rows.

### skewSampOrNull
Returns NULL if there are no rows. 