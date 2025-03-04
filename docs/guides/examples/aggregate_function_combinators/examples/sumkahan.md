# sumKahan Combinator Examples

The following combinators can be applied to the `sumKahan` function:

### sumKahanIf
Calculates Kahan summation only for rows that match the given condition.

### sumKahanArray
Calculates Kahan summation of elements in the array.

### sumKahanMap
Calculates Kahan summation for each key in the map separately.

### sumKahanSimpleState
Returns the Kahan summation with SimpleAggregateFunction type.

### sumKahanState
Returns the intermediate state of Kahan summation calculation.

### sumKahanMerge
Combines intermediate states to get the final Kahan summation.

### sumKahanMergeState
Combines intermediate states but returns an intermediate state.

### sumKahanForEach
Calculates Kahan summation for corresponding elements in multiple arrays.

### sumKahanDistinct
Calculates Kahan summation using distinct values only.

### sumKahanOrDefault
Returns 0 if there are no rows to sum.

### sumKahanOrNull
Returns NULL if there are no rows to sum. 