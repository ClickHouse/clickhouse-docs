# varSampStable Combinator Examples

The following combinators can be applied to the `varSampStable` function:

### varSampStableIf
Calculates sample variance using numerically stable algorithm only for rows that match the given condition.

### varSampStableArray
Calculates sample variance using numerically stable algorithm from elements in the array.

### varSampStableMap
Calculates sample variance using numerically stable algorithm for each key in the map separately.

### varSampStableSimpleState
Returns the sample variance state with SimpleAggregateFunction type.

### varSampStableState
Returns the intermediate state of sample variance calculation.

### varSampStableMerge
Combines intermediate states to get the final sample variance.

### varSampStableMergeState
Combines intermediate states but returns an intermediate state.

### varSampStableForEach
Calculates sample variance using numerically stable algorithm for corresponding elements in multiple arrays.

### varSampStableDistinct
Calculates sample variance using numerically stable algorithm using distinct values only.

### varSampStableOrDefault
Returns 0 if there are no rows.

### varSampStableOrNull
Returns NULL if there are no rows. 