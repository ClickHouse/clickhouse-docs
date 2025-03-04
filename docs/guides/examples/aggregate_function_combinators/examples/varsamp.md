# varSamp Combinator Examples

The following combinators can be applied to the `varSamp` function:

### varSampIf
Calculates sample variance only for rows that match the given condition.

### varSampArray
Calculates sample variance of elements in the array.

### varSampMap
Calculates sample variance for each key in the map separately.

### varSampSimpleState
Returns the variance value with SimpleAggregateFunction type.

### varSampState
Returns the intermediate state of variance calculation.

### varSampMerge
Combines intermediate states to get the final variance.

### varSampMergeState
Combines intermediate states but returns an intermediate state.

### varSampForEach
Calculates sample variance for corresponding elements in multiple arrays.

### varSampDistinct
Calculates sample variance using distinct values only.

### varSampOrDefault
Returns 0 if there are not enough rows to calculate variance.

### varSampOrNull
Returns NULL if there are not enough rows to calculate variance. 